import styles from "./Card.module.css"


import Link from "next/link"
import { ArrowIcon } from "./ArrowIcon"

export interface CardProps {
  title: string
  description: string
  icon?: React.ReactNode
  href: string
}

export function Card({ title, description, icon, href }: CardProps) {
  return (
    <div className={styles.card}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <Link href={href} className={styles.arrowLink} tabIndex={0} aria-label={`Go to ${title}`}>
        <ArrowIcon size={28} color="#fff" />
      </Link>
    </div>
  )
}
