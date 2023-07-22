import { useRouter } from "next/router";
import { LoremIpsum } from "lorem-ipsum";

export default function Color({ id, description }) {
    const router = useRouter();
    if (router.isFallback) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            Brand {id}: {description}
        </div>
    );
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: true,
    };
};

export const getStaticProps = async ({ params: { id } }) => {
    await new Promise(r => setTimeout(r, 3000));
    const description = new LoremIpsum().generateWords(7);
    return {
        props: { id, description }
    };
};
