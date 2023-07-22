import { colors } from "@/lib/data";

export default function Color({ id, description }) {
    return <div>Color {id}: {description}</div>;
}

export const getStaticPaths = () => {
    return {
        paths: colors().map((id) => ({
            params: {
                id,
            },
        })),
        fallback: false,
    };
};

export const getStaticProps = ({ params: { id } }) => {
    const description = `${id} is nice`;
    return { props: { id, description } };
};
