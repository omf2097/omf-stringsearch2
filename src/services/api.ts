import tagsUrl from "../data/taglist.json?url";
import stringsUrl from "../data/strings.json?url";
import type {Scripts, TagTypes} from "@/services/types";


export async function fetchTags(): Promise<TagTypes> {
    const result = await fetch(tagsUrl);
    return result.json();
}

export async function fetchStrings(): Promise<Scripts> {
    const result = await fetch(stringsUrl);
    return result.json();
}
