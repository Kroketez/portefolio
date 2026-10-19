import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { useApp } from '../lib/app'
import { track } from '../lib/db'

/**
 * Downloads the CV. When a PDF was uploaded in the backoffice it is downloaded
 * directly; otherwise the CV page is opened and printed, which lets the visitor
 * save it as PDF from the browser.
 */
export function CvButton({ className, label, print }: { className: string; label: string; print?: boolean }) {
  const { c } = useApp()
  const pdf = c('cv_pdf_url')
  const count = () => void track('/cv', 'cv_download')

  if (pdf) {
    return (
      <a className={className} href={pdf} download="cv.pdf" target="_blank" rel="noreferrer" onClick={count}>
        <Icon name="download" />
        {label}
      </a>
    )
  }
  if (print) {
    return (
      <button
        className={className}
        onClick={() => {
          count()
          window.print()
        }}
      >
        <Icon name="download" />
        {label}
      </button>
    )
  }
  return (
    <Link className={className} to="/cv">
      <Icon name="download" />
      {label}
    </Link>
  )
}
