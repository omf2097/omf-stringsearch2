

export type TagType = {
    tag: string,
    has_param: boolean,
    desc: string,
};

export type TagTypes = TagType[];

export type Errata = "LEADING_ZERO" | "LEADING_PLUS" | "INVALID";
export type ScriptType = "base_string";

export type Tag = {
    key: string,
    value: null | number,
    erratas: Errata[],
};

export type Frame = {
    key: string,
    duration: number,
    tags: Tag[],
    erratas: Errata[],
};

export type Script = {
    data: Frame[],
    source_file: string,
    source_animation: number,
    original: string,
    type: ScriptType
};

export type Scripts = Script[];

