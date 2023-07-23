let count = 0

export default function Counter({ count }) {
  return <div>{count}</div>
}

export function getServerSideProps() {
  return {
    props: {
      count: count++
    }
  }
}
