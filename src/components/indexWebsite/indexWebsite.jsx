import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ReactComponent as Logo } from '../../assets/web/logo.svg'
import { ReactComponent as Giddh } from '../../assets/web/logos/giddh.svg'
import { ReactComponent as Socket } from '../../assets/web/logos/socket.svg'
import { ReactComponent as Freejun } from '../../assets/web/logos/freejun.svg'
import { ReactComponent as Msg91 } from '../../assets/web/logos/msg91.svg'
import { ReactComponent as Dbdash } from '../../assets/web/logos/dbdash.svg'
import { ReactComponent as Walkover } from '../../assets/web/logos/walkover.svg'
import { MdAccessTimeFilled, MdGroups, MdRocketLaunch, MdApi } from 'react-icons/md'
import heroImg from '../../assets/web/hero_img.png'
import content from './indexWebsite.json'
import './indexWebsite.scss'

export default function IndexWebsite() {
  return (
    <>
      <div className='web_body'>
        <div>
          {/* navbar */}
          <div className='navigation d-flex justify-content-between container'>
            <Logo className='web_logo' />
            <div className='d-flex align-items-center nav-menu'>
              <a href='/login'>
                <button className='btn web_btn-login web_btn-rg web_btn'>Login</button>
              </a>
              <a href='/login'>
                <button className='btn web_btn-primary web_btn-rg web_btn '>Signup</button>
              </a>
            </div>
          </div>
          {/* navbar */}
          <div className='web_hero container d-flex flex-column gy-4'>
            <div>
              <p className='web_tagline'>The developer's toolkit</p>
              <h1 className='web_h1'>
                Test & <br />
                <span className='font-american web_text-primary'>Document APIs</span>
                <br />
                Faster with TechDoc
              </h1>
              <p className='web_tagline'>The Ultimate Free Solution for Your API Needs!</p>
              <a href='/login'>
                {' '}
                <button className='btn web_btn-primary web_btn-rg web_btn'>Get Started for free</button>
              </a>
            </div>
            <img src={heroImg} alt='Hero Image' /> {/* Use the imported image */}
          </div>
        </div>
        <div className='web_bg-sec py-5'>
          <div className='container d-flex flex-column'>
            <h2 className='web_h2 mb-5'>
              Experience <span className='font-american '>the Benefits </span>
              <br />
              of TechDoc
            </h2>
            <div className='web_benifit_grid '>
              {content?.benefits?.length &&
                content?.benefits?.map((benifit, i) => {
                  let icon = null

                  switch (benifit.slug) {
                    case 'productivity':
                      icon = <MdAccessTimeFilled fontSize={40} color='#EC5413' />
                      break
                    case 'collaboration':
                      icon = <MdGroups fontSize={40} color='#EC5413' />
                      break
                    case 'efficiency':
                      icon = <MdRocketLaunch fontSize={40} color='#EC5413' />
                      break
                    case 'apis':
                      icon = <MdApi fontSize={40} color='#EC5413' />
                      break
                    default:
                      icon = null
                  }
                  return (
                    <>
                      <div className=' d-flex flex-column '>
                        {icon}
                        <h3 dangerouslySetInnerHTML={{ __html: benifit?.name }} className='my-3'></h3>
                        <p>{benifit?.description}</p>
                      </div>
                    </>
                  )
                })}
            </div>
          </div>
        </div>
        <div className=' bg-white py-5'>
          <div className='container web_cont d-flex flex-column'>
            <h2 className='web_h2 mb-5'>
              The results speak for themselves,
              <br />
              <span className='font-american '>so do our customers</span>
            </h2>
            <div className='web_logogrid'>
              {content?.customers &&
                content.customers?.map((customer, i) => {
                  let LogoComponent = null

                  switch (customer.name) {
                    case 'giddh':
                      LogoComponent = <Giddh />
                      break
                    case 'socket':
                      LogoComponent = <Socket />
                      break
                    case 'freejun':
                      LogoComponent = <Freejun />
                      break
                    case 'msg91':
                      LogoComponent = <Msg91 />
                      break
                    case 'dbdash':
                      LogoComponent = <Dbdash />
                      break
                    case 'walkover':
                      LogoComponent = <Walkover />
                      break
                    default:
                      LogoComponent = null
                  }

                  return (
                    <a
                      href={customer.urls}
                      target='_blank'
                      key={i}
                      className={`${i == 2 || i == 3 ? 'col_span_2' : 'col_span-1'} grid_col`}
                      aria-label="website icons"
                    >
                      {LogoComponent}
                    </a>
                  )
                })}
            </div>
          </div>
        </div>

        <div className='container web_cont'>
          <div className='d-flex flex-md-row flex-column  justify-content-between align-items-center'>
            <Logo className='web_logo' />
            {/* <ul className='web_list d-flex flex-column'>
            <li>
              <a href='https://walkover.in' target='_blank' className='text-dark'>About Us</a>
            </li>
         
          </ul> */}
            <p className='m-0'>© 2024 TechDoc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  )
}
