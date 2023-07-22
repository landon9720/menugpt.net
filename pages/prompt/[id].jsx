import { useRouter } from "next/router";
import { LoremIpsum } from "lorem-ipsum";
import { database } from "@/lib/data";

export default function Color({ id, prompt, body }) {
    const router = useRouter();
    if (router.isFallback) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <h1>
                Prompt {id}: {prompt}
            </h1>
            <p>{body}</p>
        </div>
    );
}

export const getStaticPaths = () => {
    return {
        paths: Object.keys(database).map((id) => {
            return {
                params: {
                    id,
                },
            };
        }),
        fallback: true,
    };
};

const gen = new LoremIpsum();

export const getStaticProps = async ({ params: { id } }) => {
    var record = database[id];
    if (!record) {
        record = {
            id,
            prompt: "unknown",
            body: gen.generateWords(7)
        }
        database[id] = record;
    }
    return {
        props: { id, prompt: record.prompt, body: record.body },
    };
};
