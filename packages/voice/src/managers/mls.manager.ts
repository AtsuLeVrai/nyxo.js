import { createHash, randomBytes } from "node:crypto";
import type {
  MlsCommitData,
  MlsExternalSenderData,
  MlsKeyInfo,
  MlsProposalData,
} from "../types/index.js";

export enum MlsProposalType {
  Add = 1,
  Remove = 2,
  Update = 3,
}

interface MlsGroup {
  epoch: number;
  groupId: Buffer;
  keyPackage: Buffer;
  externalSender: MlsExternalSenderData;
  members: Map<string, number>;
  ratchetTree: MlsRatchetTree;
}

interface MlsTreeNode {
  publicKey: Buffer;
  parent: number;
  leftChild: number;
  rightChild: number;
  unmergedLeaves: number[];
}

interface MlsRatchetTree {
  nodes: Map<number, MlsTreeNode>;
  size: number;
}

interface ProposalValidationResult {
  type: MlsProposalType;
  sender: Buffer;
  isValid: boolean;
}

export class MlsManager {
  static readonly HASH_SIZE = 32;
  static readonly SIGNATURE_SIZE = 64;
  static readonly KEY_PACKAGE_LIFETIME = 24 * 60 * 60 * 1000; // 24 hours
  #externalSender: MlsExternalSenderData | null = null;
  #keyPair: MlsKeyInfo | null = null;
  #group: MlsGroup | null = null;
  #ratchetTree: MlsRatchetTree | null = null;
  #pendingProposals: Set<string> = new Set();

  getExternalSender(): MlsExternalSenderData {
    if (!this.#externalSender) {
      throw new Error("External sender not set");
    }
    return this.#externalSender;
  }

  setExternalSender(data: MlsExternalSenderData): void {
    this.#externalSender = data;
  }

  initialize(): void {
    this.#generateIdentityKeyPair();
    this.#ratchetTree = this.#createEmptyRatchetTree();
  }

  generateKeyPackage(): Buffer {
    if (!this.#keyPair) {
      throw new Error("Identity key pair not initialized");
    }

    // Create key package buffer
    const keyPackage = Buffer.alloc(512);
    let offset = 0;

    // Write protocol version (2 bytes)
    keyPackage.writeUInt16BE(1, offset);
    offset += 2;

    // Write cipher suite (2 bytes) - AES-128-GCM + P-256
    keyPackage.writeUInt16BE(1, offset);
    offset += 2;

    // Write init key (public key)
    this.#keyPair.publicKey.copy(keyPackage, offset);
    offset += this.#keyPair.publicKey.length;

    // Write identity public key
    this.#keyPair.publicKey.copy(keyPackage, offset);
    offset += this.#keyPair.publicKey.length;

    // Write expiration time (8 bytes)
    const expiry = Date.now() + MlsManager.KEY_PACKAGE_LIFETIME;
    keyPackage.writeBigUInt64BE(BigInt(expiry), offset);
    offset += 8;

    // Write extensions
    offset = this.#writeExtensions(keyPackage, offset);

    // Write signature
    const signature = this.#signKeyPackage(keyPackage.subarray(0, offset));
    signature.copy(keyPackage, offset);
    offset += signature.length;

    return keyPackage.subarray(0, offset);
  }

  createInitialGroup(): MlsGroup {
    if (!(this.#externalSender && this.#keyPair && this.#ratchetTree)) {
      throw new Error("Manager not properly initialized");
    }

    // Générer l'ID du groupe
    const groupId = randomBytes(32);

    // Créer l'arbre initial avec notre feuille
    const leafIndex = 0;
    const newRatchetTree = { ...this.#ratchetTree };
    newRatchetTree.nodes.set(leafIndex, {
      publicKey: this.#keyPair.publicKey,
      parent: -1,
      leftChild: -1,
      rightChild: -1,
      unmergedLeaves: [],
    });

    // Générer le key package initial
    const keyPackage = this.generateKeyPackage();

    // Créer le groupe
    const newGroup: MlsGroup = {
      epoch: 1,
      groupId,
      keyPackage,
      externalSender: this.#externalSender,
      members: new Map([[this.#keyPair.keyId, leafIndex]]),
      ratchetTree: newRatchetTree,
    };

    this.#group = newGroup;
    return newGroup;
  }

  handleProposals(data: MlsProposalData): void {
    if (!this.#group) {
      throw new Error("No active MLS group");
    }

    // Traiter et valider chaque proposition
    for (const proposalStr of data.proposals) {
      const validation = this.#validateProposal(proposalStr);
      if (validation.isValid) {
        this.#pendingProposals.add(proposalStr);
        this.#processProposal(proposalStr, validation.type);
      }
    }
  }

  handleCommit(data: MlsCommitData): MlsGroup {
    if (!this.#group) {
      throw new Error("No active MLS group");
    }

    // Verify that commit includes all pending proposals
    for (const proposal of this.#pendingProposals) {
      if (!this.#isProposalInCommit(proposal, data.commit)) {
        throw new Error("Commit missing required proposal");
      }
    }

    // Process commit
    const newGroup = this.#processCommit(data);

    // Clear pending proposals
    this.#pendingProposals.clear();

    // Update group state
    this.#group = newGroup;

    return newGroup;
  }

  updateGroupProtocolVersion(epochId: number): void {
    if (!this.#group) {
      throw new Error("No active MLS group");
    }

    // Update epoch
    this.#group.epoch = epochId;

    // Generate new key package for the updated protocol version
    this.#group.keyPackage = this.generateKeyPackage();

    // Update ratchet tree root
    if (this.#ratchetTree) {
      this.#updateRatchetTreeRoot();
    }
  }

  destroy(): void {
    this.#externalSender = null;
    this.#keyPair = null;
    this.#group = null;
    this.#ratchetTree = null;
    this.#pendingProposals.clear();
  }

  #generateIdentityKeyPair(): void {
    // Generate a secure random secret key
    const secretKey = randomBytes(32);

    // Derive public key using P-256 curve
    const publicKey = this.#derivePublicKey(secretKey);

    this.#keyPair = {
      secretKey,
      publicKey,
      keyId: this.#generateKeyId(publicKey),
    };
  }

  #createEmptyRatchetTree(): MlsRatchetTree {
    return {
      nodes: new Map<number, MlsTreeNode>(),
      size: 0,
    };
  }

  #validateProposal(proposal: string): ProposalValidationResult {
    try {
      const proposalBuffer = Buffer.from(proposal, "base64");
      const proposalType = proposalBuffer.readUInt8(0) as MlsProposalType;
      const senderId = proposalBuffer.subarray(1, 33);
      const signature = proposalBuffer.subarray(-64);
      const signedData = proposalBuffer.subarray(0, -64);

      return {
        type: proposalType,
        sender: senderId,
        isValid: this.#verifySignature(senderId, signedData, signature),
      };
    } catch (_error) {
      return {
        type: MlsProposalType.Add,
        sender: Buffer.alloc(0),
        isValid: false,
      };
    }
  }

  #processProposal(proposal: string, proposalType: MlsProposalType): void {
    const proposalBuffer = Buffer.from(proposal, "base64");

    switch (proposalType) {
      case MlsProposalType.Add:
        this.#handleAddProposal(proposalBuffer);
        break;
      case MlsProposalType.Remove:
        this.#handleRemoveProposal(proposalBuffer);
        break;
      case MlsProposalType.Update:
        this.#handleUpdateProposal(proposalBuffer);
        break;
      default:
        throw new Error(`Unknown proposal type: ${proposalType}`);
    }
  }

  #handleAddProposal(proposalData: Buffer): void {
    if (!this.#group) {
      throw new Error("Group not initialized");
    }

    // Extraire le key package
    const keyPackageStart = 33;
    const keyPackageSize = proposalData.readUInt16BE(keyPackageStart);
    const keyPackageData = proposalData.subarray(
      keyPackageStart + 2,
      keyPackageStart + 2 + keyPackageSize,
    );

    // Valider le key package
    const { publicKey, keyId } = this.#validateKeyPackage(keyPackageData);

    // Ajouter une nouvelle feuille
    const leafIndex = this.#group.ratchetTree.size;
    const newNodes = new Map(this.#group.ratchetTree.nodes);
    newNodes.set(leafIndex, {
      publicKey,
      parent: -1,
      leftChild: -1,
      rightChild: -1,
      unmergedLeaves: [],
    });

    // Mettre à jour l'arbre et les membres
    const newRatchetTree = {
      ...this.#group.ratchetTree,
      nodes: newNodes,
      size: this.#group.ratchetTree.size + 1,
    };

    const newMembers = new Map(this.#group.members);
    newMembers.set(keyId, leafIndex);

    this.#group = {
      ...this.#group,
      ratchetTree: newRatchetTree,
      members: newMembers,
    };
  }

  #handleRemoveProposal(proposal: Buffer): void {
    if (!(this.#group && this.#ratchetTree)) {
      throw new Error("Group not initialized");
    }

    // Extract removed member's key ID
    const keyId = proposal.subarray(33, 65).toString("hex");

    // Find member's leaf index
    const leafIndex = this.#group.members.get(keyId);
    if (leafIndex === undefined) {
      throw new Error("Member not found");
    }

    // Mark leaf as removed in ratchet tree
    const leaf = this.#ratchetTree.nodes.get(leafIndex);
    if (leaf) {
      leaf.publicKey = Buffer.alloc(0); // Empty public key indicates removal
    }

    // Remove from member mapping
    this.#group.members.delete(keyId);
  }

  #handleUpdateProposal(proposal: Buffer): void {
    if (!(this.#group && this.#ratchetTree)) {
      throw new Error("Group not initialized");
    }

    // Extract updated key package
    const keyPackageStart = 33;
    const keyPackageSize = proposal.readUInt16BE(keyPackageStart);
    const keyPackage = proposal.subarray(
      keyPackageStart + 2,
      keyPackageStart + 2 + keyPackageSize,
    );

    // Validate key package
    const { publicKey, keyId } = this.#validateKeyPackage(keyPackage);

    // Update leaf in ratchet tree
    const leafIndex = this.#group.members.get(keyId);
    if (leafIndex === undefined) {
      throw new Error("Member not found");
    }

    const leaf = this.#ratchetTree.nodes.get(leafIndex);
    if (leaf) {
      leaf.publicKey = publicKey;
    }
  }

  #processCommit(data: MlsCommitData): MlsGroup {
    if (!this.#group) {
      throw new Error("No active MLS group");
    }

    // Process commit data
    const commitBuffer = Buffer.from(data.commit, "base64");

    // Verify commit signature
    const signature = commitBuffer.subarray(-64);
    const signedData = commitBuffer.subarray(0, -64);
    const senderId = commitBuffer.subarray(0, 32);

    if (!this.#verifySignature(senderId, signedData, signature)) {
      throw new Error("Invalid commit signature");
    }

    // Update group epoch
    const newEpoch = this.#group.epoch + 1;

    // Generate new key package
    const newKeyPackage = this.generateKeyPackage();

    // Return new group state
    return {
      ...this.#group,
      epoch: newEpoch,
      keyPackage: newKeyPackage,
    };
  }

  #isProposalInCommit(proposal: string, commit: string): boolean {
    const commitBuffer = Buffer.from(commit, "base64");
    const proposalBuffer = Buffer.from(proposal, "base64");

    // Compare proposal hash with commit's proposal references
    const proposalHash = createHash("sha256").update(proposalBuffer).digest();

    // Extract and check each proposal reference in commit
    let offset = 33; // Skip sender ID
    const proposalCount = commitBuffer.readUInt16BE(offset);
    offset += 2;

    for (let i = 0; i < proposalCount; i++) {
      const reference = commitBuffer.subarray(offset, offset + 32);
      if (reference.equals(proposalHash)) {
        return true;
      }
      offset += 32;
    }

    return false;
  }

  #updateRatchetTreeRoot(): void {
    if (!this.#ratchetTree) {
      return;
    }

    // Update path to root for all modified leaves
    const modifiedNodes = new Set<number>();

    for (const [index, node] of this.#ratchetTree.nodes) {
      if (node.unmergedLeaves.length > 0) {
        this.#updatePath(index, modifiedNodes);
      }
    }
  }

  #updatePath(leafIndex: number, modifiedNodes: Set<number>): void {
    if (!this.#ratchetTree) {
      return;
    }

    let currentIndex = leafIndex;
    while (currentIndex >= 0) {
      const node = this.#ratchetTree.nodes.get(currentIndex);
      if (!node) {
        break;
      }

      modifiedNodes.add(currentIndex);
      currentIndex = node.parent;
    }
  }

  #derivePublicKey(secretKey: Buffer): Buffer {
    // In a real implementation, this would use proper P-256 key derivation
    // For example purposes, we're just hashing the secret key
    return createHash("sha256").update(secretKey).digest();
  }

  #generateKeyId(publicKey: Buffer): string {
    return createHash("sha256").update(publicKey).digest("hex");
  }

  #validateKeyPackage(keyPackage: Buffer): {
    publicKey: Buffer;
    keyId: string;
  } {
    // Extract public key from key package
    const publicKey = keyPackage.subarray(4, 36); // After version and cipher suite
    const keyId = this.#generateKeyId(publicKey);

    // Verify signature
    const signature = keyPackage.subarray(-64);
    const signedData = keyPackage.subarray(0, -64);

    if (!this.#verifySignature(publicKey, signedData, signature)) {
      throw new Error("Invalid key package signature");
    }

    return { publicKey, keyId };
  }

  #verifySignature(
    _publicKey: Buffer,
    data: Buffer,
    signature: Buffer,
  ): boolean {
    // In a real implementation, this would verify the signature using P-256
    // For example purposes, we're just comparing hashes
    const dataHash = createHash("sha256").update(data).digest();
    const signatureHash = createHash("sha256").update(signature).digest();
    return dataHash.equals(signatureHash);
  }

  #writeExtensions(buffer: Buffer, startOffset: number): number {
    if (!this.#externalSender) {
      throw new Error("External sender not set");
    }

    // Track current position without modifying the parameter
    let currentPosition = startOffset;

    // Write external sender extension
    buffer.writeUInt16BE(1, currentPosition); // Extension type
    currentPosition += 2;

    const senderData = Buffer.from(JSON.stringify(this.#externalSender));
    buffer.writeUInt16BE(senderData.length, currentPosition);
    currentPosition += 2;

    senderData.copy(buffer, currentPosition);
    currentPosition += senderData.length;

    return currentPosition;
  }

  #signKeyPackage(data: Buffer): Buffer {
    if (!this.#keyPair) {
      throw new Error("Key pair not initialized");
    }

    // In a real implementation, this would sign with P-256
    // For example purposes, we're just providing a hash
    return createHash("sha256")
      .update(data)
      .update(this.#keyPair.secretKey)
      .digest();
  }
}
