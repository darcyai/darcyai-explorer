import React from 'react'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

import { ReactComponent as Logo } from '../assets/logo.svg'
import { ReactComponent as DocsIcon } from '../assets/docs.svg'
import { ReactComponent as GithubIcon } from '../assets/github.svg'

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.neutral[5],
      color: theme.palette.neutral[0],
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
      alignItems: 'center',
      width: '100%',
      height: theme.spacing(7),
      font: 'Gilroy',
      textTransform: 'uppercase'
    },
    logo: {
      display: 'flex',
      gap: theme.spacing(1),
      color: theme.palette.neutral[0],
      alignItems: 'center',
      font: 'normal normal 600 14px/17px Gilroy',
      letterSpacing: '0.35px',
      '& svg': {
        height: 32
      }
    },
    links: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(4),
      [theme.breakpoints.up('md')]: {
        gap: theme.spacing(4)
      }
    },
    link: {
      display: 'flex',
      gap: theme.spacing(1),
      color: theme.palette.primary.main,
      textDecoration: 'none',
      font: 'normal normal 500 12px/16px Gilroy',
      letterSpacing: '0.24px',
      '& svg': {
        '& path': {
          fill: theme.palette.primary.main
        }
      },
      '&:hover': {
        color: theme.palette.neutral[0],
        '& svg': {
          '& path': {
            fill: theme.palette.neutral[0]
          }
        }
      }
    },
    linkText: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'block'
      }
    }
  }
})

const Navbar: React.FC = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.logo}>
        <Logo />
        {/* <span>Darcy AI Explorer</span> */}
      </div>
      <div className={classes.links}>
        <a className={classes.link} href='https://docs.darcy.ai/docs/ai/' target='_blank' rel='noreferrer'>
          <DocsIcon />
          <span className={classes.linkText}>Developer docs</span>
        </a>
        <a className={classes.link} href='https://github.com/darcyai/darcyai' target='_blank' rel='noreferrer'>
          <GithubIcon />
          <span className={classes.linkText}>Darcy AI Engine</span>
        </a>
      </div>
    </div>
  )
}

export default Navbar
