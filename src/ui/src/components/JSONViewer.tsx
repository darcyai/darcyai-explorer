import React from 'react'
import { Theme, useTheme } from '@mui/material'
import ReactJson, { ReactJsonViewProps, ThemeObject } from 'react-json-view'
import edgeColors from '../Theme/colors'

export function useAceEditorSolarizedTheme (theme: Theme): ThemeObject {
  return {
    base00: theme.palette.neutral[4] ?? '', // Default Background
    base01: '#586E75', // Lighter Background (Used for status bars, line number and folding marks)
    base02: '#073642', // Selection Background
    base03: '#002B36', // Comments, Invisibles, Line Highlighting
    base04: '#FFFFFF', // ??
    base05: '#FFFFFF', // ??
    base06: '#FFFFFF', // ??
    base07: '#93A1A1', // keys
    base08: '#FFFFFF', // ??
    base09: '#2AA198', // Strings
    base0A: '#859900', // NULL
    base0B: '#FFFFFF', // ??
    base0C: '#859900', // gutter numbers
    base0D: edgeColors.blue as string, // expended icon
    base0E: edgeColors.blue as string, // booleans, closed icon
    base0F: '#268BD2' // Integers
  }
}

export const viewerDefaultOptions: Partial<ReactJsonViewProps> = {
  displayDataTypes: false,
  displayObjectSize: false,
  iconStyle: 'square',
  enableClipboard: false
}

export const ReactJSONView: React.FC<ReactJsonViewProps> = ({ children, style, ...props }) => {
  const theme = useTheme()
  const JSONViewerTheme = useAceEditorSolarizedTheme(theme)

  return <ReactJson style={{ ...style }} theme={JSONViewerTheme} {...{ ...viewerDefaultOptions, ...props }} />
}

export default ReactJSONView
