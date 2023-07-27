import styles from './Timestamp.module.css'

export default function Timestamp({ timestamp }: { timestamp: string }) {
  return <p className={styles.timestamp}>{new Date(timestamp).toUTCString()}</p>
}
