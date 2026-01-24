"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./Footer.module.css"

export function Footer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [copied, setCopied] = useState(false)
  const cursorFollowerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  // Cursor follower effect
  useEffect(() => {
    const follower = cursorFollowerRef.current
    const footer = footerRef.current
    
    if (!follower || !footer) return

    const handleMouseMove = (e: MouseEvent) => {
      const footerRect = footer.getBoundingClientRect()
      const isInFooter = 
        e.clientX >= footerRect.left &&
        e.clientX <= footerRect.right &&
        e.clientY >= footerRect.top &&
        e.clientY <= footerRect.bottom

      if (isInFooter) {
        // Calculate position relative to footer
        const x = e.clientX - footerRect.left
        const y = e.clientY - footerRect.top
        
        follower.style.opacity = "1"
        follower.style.left = `${x}px`
        follower.style.top = `${y}px`
      } else {
        follower.style.opacity = "0"
      }
    }

    const handleMouseLeave = () => {
      follower.style.opacity = "0"
    }

    footer.addEventListener("mousemove", handleMouseMove)
    footer.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      footer.removeEventListener("mousemove", handleMouseMove)
      footer.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const copyEmail = () => {
    navigator.clipboard.writeText("hello@agency.com")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.cursorFollower} ref={cursorFollowerRef}></div>
      
      <div className={styles.footerContent}>
        {/* Main Contact Grid */}
        <div className={styles.contactGrid}>
          {/* Left Side - Big Email */}
          <div className={styles.emailSection}>
            <p className={styles.sayHello}>Say Hello</p>
            <button 
              onClick={copyEmail}
              className={styles.bigEmail}
            >
              <span className={styles.emailLine}>hello@</span>
              <span className={styles.emailLine}>agency.com</span>
            </button>
            {copied && <span className={styles.copiedToast}>Copied!</span>}
          </div>

          {/* Right Side - Title + Form */}
          <div className={styles.formSection}>
            <div className={styles.formHeader}>
              <h2 className={styles.contactTitle}>Let's Work Together</h2>
              <p className={styles.contactSubtitle}>Have a project in mind? Let's make it happen.</p>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className={styles.formTextarea}
                />
              </div>
              
              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className={styles.footerBottom}>
          <span className={styles.copyright}>© 2026 Agency. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
