"use client"

import styles from "./Header.module.css"

export function Header() {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerBar} />
      <button className={styles.orderButton}>Order Now</button>
    </div>
  )
}
