"use client"
import { useRouter } from 'next/navigation';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className={styles.navbar}>
      <div onClick={() => router.push("/")} className={styles.logo}></div>
      <ul className={styles.navLinks}>
        <li><a href="/">Dashboard</a></li>
        <li><a href="#">Credit Memos</a></li>
        <li><a href="#">Reports</a></li>
        <li><a href="#">Settings</a></li>
      </ul>
    </nav>
  );
}
