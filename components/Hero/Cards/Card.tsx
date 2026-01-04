import styles from "./Card.module.css"

interface CardProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export function Card({ title, description, icon }: CardProps) {
  return (
    <div className={styles.card}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  )
}
