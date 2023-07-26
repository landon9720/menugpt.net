import styles from './avatar.module.css'

export function Avatar({ user }) {
  const { picture, nickname } = user
  return (
    <>
      <img className={styles.avatar} src={picture} alt="Avatar" /> {nickname}
    </>
  )
}
