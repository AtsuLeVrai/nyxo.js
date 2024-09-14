import type {
    EmbedAuthorStructure,
    EmbedFieldStructure,
    EmbedFooterStructure,
    EmbedImageStructure,
    EmbedProviderStructure,
    EmbedStructure,
    EmbedThumbnailStructure,
    EmbedTypes,
    EmbedVideoStructure,
    Integer,
    IsoO8601Timestamp,
} from "@nyxjs/core";
import { Base } from "./Base";

export class EmbedField extends Base<EmbedFieldStructure> {
    public inline?: boolean;

    public name!: string;

    public value!: string;

    public constructor(data: Readonly<Partial<EmbedFieldStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmbedFieldStructure>>): void {
        if ("inline" in data) {
            if (data.inline === null) {
                this.inline = undefined;
            } else if (data.inline !== undefined) {
                this.inline = data.inline;
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.value !== undefined) {
            this.value = data.value;
        }
    }
}

export class EmbedFooter extends Base<EmbedFooterStructure> {
    public iconUrl?: string;

    public proxyIconUrl?: string;

    public text!: string;

    public constructor(data: Readonly<Partial<EmbedFooterStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmbedFooterStructure>>): void {
        if ("icon_url" in data) {
            if (data.icon_url === null) {
                this.iconUrl = undefined;
            } else if (data.icon_url !== undefined) {
                this.iconUrl = data.icon_url;
            }
        }

        if ("proxy_icon_url" in data) {
            if (data.proxy_icon_url === null) {
                this.proxyIconUrl = undefined;
            } else if (data.proxy_icon_url !== undefined) {
                this.proxyIconUrl = data.proxy_icon_url;
            }
        }

        if (data.text !== undefined) {
            this.text = data.text;
        }
    }
}

export class EmbedAuthor extends Base<EmbedAuthorStructure> {
    public iconUrl?: string;

    public name!: string;

    public proxyIconUrl?: string;

    public url?: string;

    public constructor(data: Readonly<Partial<EmbedAuthorStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmbedAuthorStructure>>): void {
        if ("icon_url" in data) {
            if (data.icon_url === null) {
                this.iconUrl = undefined;
            } else if (data.icon_url !== undefined) {
                this.iconUrl = data.icon_url;
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("proxy_icon_url" in data) {
            if (data.proxy_icon_url === null) {
                this.proxyIconUrl = undefined;
            } else if (data.proxy_icon_url !== undefined) {
                this.proxyIconUrl = data.proxy_icon_url;
            }
        }

        if ("url" in data) {
            if (data.url === null) {
                this.url = undefined;
            } else if (data.url !== undefined) {
                this.url = data.url;
            }
        }
    }
}

export class EmbedProvider extends Base<EmbedProviderStructure> {
    public name?: string;

    public url?: string;

    public constructor(data: Readonly<Partial<EmbedProviderStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmbedProviderStructure>>): void {
        if ("name" in data) {
            if (data.name === null) {
                this.name = undefined;
            } else if (data.name !== undefined) {
                this.name = data.name;
            }
        }

        if ("url" in data) {
            if (data.url === null) {
                this.url = undefined;
            } else if (data.url !== undefined) {
                this.url = data.url;
            }
        }
    }
}

export class EmbedImage extends Base<EmbedImageStructure> {
    public height?: Integer;

    public proxyUrl?: string;

    public url!: string;

    public width?: Integer;

    public constructor(data: Readonly<Partial<EmbedImageStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmbedImageStructure>>): void {
        if ("height" in data) {
            if (data.height === null) {
                this.height = undefined;
            } else if (data.height !== undefined) {
                this.height = data.height;
            }
        }

        if ("proxy_url" in data) {
            if (data.proxy_url === null) {
                this.proxyUrl = undefined;
            } else if (data.proxy_url !== undefined) {
                this.proxyUrl = data.proxy_url;
            }
        }

        if (data.url !== undefined) {
            this.url = data.url;
        }

        if ("width" in data) {
            if (data.width === null) {
                this.width = undefined;
            } else if (data.width !== undefined) {
                this.width = data.width;
            }
        }
    }
}

export class EmbedVideo extends Base<EmbedVideoStructure> {
    public height?: Integer;

    public proxyUrl?: string;

    public url!: string;

    public width?: Integer;

    public constructor(data: Readonly<Partial<EmbedVideoStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmbedVideoStructure>>): void {
        if ("height" in data) {
            if (data.height === null) {
                this.height = undefined;
            } else if (data.height !== undefined) {
                this.height = data.height;
            }
        }

        if ("proxy_url" in data) {
            if (data.proxy_url === null) {
                this.proxyUrl = undefined;
            } else if (data.proxy_url !== undefined) {
                this.proxyUrl = data.proxy_url;
            }
        }

        if (data.url !== undefined) {
            this.url = data.url;
        }

        if ("width" in data) {
            if (data.width === null) {
                this.width = undefined;
            } else if (data.width !== undefined) {
                this.width = data.width;
            }
        }
    }
}

export class EmbedThumbnail extends Base<EmbedThumbnailStructure> {
    public height?: Integer;

    public proxyUrl?: string;

    public url!: string;

    public width?: Integer;

    public constructor(data: Readonly<Partial<EmbedThumbnailStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmbedThumbnailStructure>>): void {
        if ("height" in data) {
            if (data.height === null) {
                this.height = undefined;
            } else if (data.height !== undefined) {
                this.height = data.height;
            }
        }

        if ("proxy_url" in data) {
            if (data.proxy_url === null) {
                this.proxyUrl = undefined;
            } else if (data.proxy_url !== undefined) {
                this.proxyUrl = data.proxy_url;
            }
        }

        if (data.url !== undefined) {
            this.url = data.url;
        }

        if ("width" in data) {
            if (data.width === null) {
                this.width = undefined;
            } else if (data.width !== undefined) {
                this.width = data.width;
            }
        }
    }
}

export class Embed extends Base<EmbedStructure> {
    public author?: EmbedAuthor;

    public color?: Integer;

    public description?: string;

    public fields?: EmbedField[];

    public footer?: EmbedFooter;

    public image?: EmbedImage;

    public provider?: EmbedProvider;

    public thumbnail?: EmbedThumbnail;

    public timestamp?: IsoO8601Timestamp;

    public title?: string;

    public type?: EmbedTypes;

    public url?: string;

    public video?: EmbedVideo;

    public constructor(data: Readonly<Partial<EmbedStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<EmbedStructure>>): void {
        if ("author" in data) {
            if (data.author === null) {
                this.author = undefined;
            } else if (data.author !== undefined) {
                this.author = EmbedAuthor.from(data.author);
            }
        }

        if ("color" in data) {
            if (data.color === null) {
                this.color = undefined;
            } else if (data.color !== undefined) {
                this.color = data.color;
            }
        }

        if ("description" in data) {
            if (data.description === null) {
                this.description = undefined;
            } else if (data.description !== undefined) {
                this.description = data.description;
            }
        }

        if ("fields" in data) {
            if (data.fields === null) {
                this.fields = undefined;
            } else if (data.fields !== undefined) {
                this.fields = data.fields.map((field) => EmbedField.from(field));
            }
        }

        if ("footer" in data) {
            if (data.footer === null) {
                this.footer = undefined;
            } else if (data.footer !== undefined) {
                this.footer = EmbedFooter.from(data.footer);
            }
        }

        if ("image" in data) {
            if (data.image === null) {
                this.image = undefined;
            } else if (data.image !== undefined) {
                this.image = EmbedImage.from(data.image);
            }
        }

        if ("provider" in data) {
            if (data.provider === null) {
                this.provider = undefined;
            } else if (data.provider !== undefined) {
                this.provider = EmbedProvider.from(data.provider);
            }
        }

        if ("thumbnail" in data) {
            if (data.thumbnail === null) {
                this.thumbnail = undefined;
            } else if (data.thumbnail !== undefined) {
                this.thumbnail = EmbedThumbnail.from(data.thumbnail);
            }
        }

        if ("timestamp" in data) {
            if (data.timestamp === null) {
                this.timestamp = undefined;
            } else if (data.timestamp !== undefined) {
                this.timestamp = data.timestamp;
            }
        }

        if ("title" in data) {
            if (data.title === null) {
                this.title = undefined;
            } else if (data.title !== undefined) {
                this.title = data.title;
            }
        }

        if ("type" in data) {
            if (data.type === null) {
                this.type = undefined;
            } else if (data.type !== undefined) {
                this.type = data.type;
            }
        }

        if ("url" in data) {
            if (data.url === null) {
                this.url = undefined;
            } else if (data.url !== undefined) {
                this.url = data.url;
            }
        }

        if ("video" in data) {
            if (data.video === null) {
                this.video = undefined;
            } else if (data.video !== undefined) {
                this.video = EmbedVideo.from(data.video);
            }
        }
    }
}
