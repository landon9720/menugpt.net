import styles from './Timestamp.module.css'

export default function Timestamp({
  timestamp,
  title,
}: {
  timestamp: string
  title: string
}) {
  return (
    <p className={styles.timestamp} title={title}>
      {new Date(timestamp).toUTCString()}
    </p>
  )
}
