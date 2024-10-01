import React from 'react'
import { hexToRgb } from '../common/utility'
import { ReactComponent as TECHDOCPUBLISH } from '../../assets/icons/TECHDOC.svg'

function Footer({ theme }) {
  const domainName = window.location.hostname
  const domainSrc = import.meta.env.VITE_UI_URL + '?src=' + domainName

  return (
      <div className='footerWrapper'>
        <p className='for-public-view' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span className='poweredByText'>
            Powered by{' '}
          </span>
          <a
            className='hitmanLink'
            rel='noopener noreferrer'
            target='_blank'
            href={domainSrc}
            style={{ backgroundColor: hexToRgb(theme, '1') }}
            aria-label="hitman-link"
          >
            <TECHDOCPUBLISH className='techdoc-svg' />
          </a>
        </p>
      </div>
  )
}

export default Footer
