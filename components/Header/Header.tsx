"use client"

import styles from "./Header.module.css"

export function Header() {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerBar} />
      <div className={styles.orderButtonContainer}>
        <button className={styles.orderButton}>Contact Us</button>
        <div className={styles.orderButtonLineWrapper}>
          <svg
            className={styles.orderButtonLine}
            viewBox="-4 -12 148 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className={styles.wavePath}
              d="M0,0 L140,0"
              fill="none"
              stroke="#c0c0c0"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
