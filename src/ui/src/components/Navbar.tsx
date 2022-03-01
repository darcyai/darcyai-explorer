import React from 'react'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

import Logo from '../assets/darcy-logo.png'
import { ReactComponent as DocsIcon } from '../assets/docs.svg'
import { ReactComponent as GithubIcon } from '../assets/github.svg'

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.neutral[0],
      color: theme.palette.neutral[4],
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
      alignItems: 'center',
      width: '100%',
      height: theme.spacing(5),
      font: 'Gilroy',
      textTransform: 'uppercase'
    },
    logo: {
      display: 'flex',
      gap: theme.spacing(1),
      color: theme.palette.neutral[2],
      alignItems: 'center',
      font: 'normal normal 600 14px/17px Gilroy',
      letterSpacing: '0.35px'
    },
    links: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(4)
    },
    link: {
      display: 'flex',
      gap: theme.spacing(1),
      color: theme.palette.neutral[3],
      textDecoration: 'none',
      font: 'normal normal 500 12px/16px Gilroy',
      letterSpacing: '0.24px'
    }
  }
})

const Navbar: React.FC = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.logo}>
        <img src={Logo} alt='Darcy' />
        <span>Darcy AI Explorer</span>
      </div>
      <div className={classes.links}>
        <a className={classes.link} href='https://darcyai.github.io/darcyai-sdk' target='_blank' rel='noreferrer'>
          <DocsIcon />
          <span>Developer docs</span>
        </a>
        <a className={classes.link} href='https://github.com/darcyai/darcyai-sdk' target='_blank' rel='noreferrer'>
          <GithubIcon />
          <span>Darcy AI SDK</span>
        </a>
      </div>
    </div>
  )
}

export default Navbar
