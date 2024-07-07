import {type IDBPDatabase, openDB} from "idb";
import {fetchStrings, fetchTags} from "@/services/api";
import type {Script, TagType, TagTypes} from "@/services/types";

export async function useDB() {
    return openDB('data', 1, {
        upgrade (db) {
            if (!db.objectStoreNames.contains('tags')) {
                console.info("Creating tags database");
                db.createObjectStore('tags', {keyPath: 'tag'});
            }
            if (!db.objectStoreNames.contains('strings')) {
                console.info("Creating strings database");
                db.createObjectStore('strings', {autoIncrement: true, keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains('tagsToStrings')) {
                console.info("Creating tagsToStrings database");
                const ts = db.createObjectStore('tagsToStrings', {keyPath: 'id'});
                ts.createIndex('tag', 'tag', { unique: false });
            }
        }
    });
}

async function loadTags(db: IDBPDatabase) {
    const tags = await fetchTags();
    for (const tag of tags) {
        await db.put("tags", tag);
    }
    console.info(`Loaded ${tags.length} tags`);
}

export async function getTag(db: IDBPDatabase, tag: string): Promise<TagType> {
    return await db.get("tags", tag);
}

export async function getTags(db: IDBPDatabase): Promise<TagTypes> {
    return await db.getAll("tags");
}

export async function getRefs(db: IDBPDatabase, tag: string): Promise<number[]> {
    const result = await db.getAllFromIndex("tagsToStrings", "tag", tag);
    return result.map(r => r.script_id);
}

export async function getScript(db: IDBPDatabase, scriptId: number): Promise<Script> {
    return await db.get("strings", scriptId);
}

async function loadStrings(db: IDBPDatabase) {
    const scripts = await fetchStrings();
    let count = 0;
    for (const script of scripts) {
        const script_id = await db.put("strings", script);
        for (const frame of script.data) {
            for (const tag of frame.tags) {
                await db.put("tagsToStrings", {
                    tag: tag.key,
                    script_id: script_id,
                    id: `${tag.key}-${script_id}`,
                });
                count ++;
            }
        }
    }
    console.info(`Loaded ${count} string tags`);
}

export async function loadData(db: IDBPDatabase) {
    const tagsCount = await db.count("tags");
    if(tagsCount === 0) {
        await Promise.all([
            loadTags(db),
            loadStrings(db),
        ]);
    }
}
