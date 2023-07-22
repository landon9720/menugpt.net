import { colors } from "@/lib/data";
import Link from "next/link";

export default function Index({ ids }: { ids: string[] }) {
    return (
        <>
            <h1>Colors</h1>
            <ol>
                {ids.map((id) => (
                    <li key={id}>
                        <Link href={`color/${id}`}>
                            {id}
                        </Link>
                    </li>
                ))}
            </ol>
        </>
    );
}

export function getStaticProps() {
    const ids = colors();
    return {
        props: { ids },
    };
}
