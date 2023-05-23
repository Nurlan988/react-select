import { useEffect, useRef, useState } from 'react'
import styles from './select.module.css'

export type SelectOptions = {
  label: string
  value: string | number
}

type MultipleSelectProps = {
  multiple: true
  value: SelectOptions[]
  onChange: (value: SelectOptions[]) => void
}

type SingleSelectProps = {
  multiple?: false
  value: SelectOptions
  onChange: (value?: SelectOptions) => void
}

type SelectProps = {
  options: SelectOptions[]
} & (SingleSelectProps | MultipleSelectProps)

export const Select = ({multiple, value, options, onChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null)
  
  const clearOption = () => {
    multiple ? onChange([]) : onChange(undefined)
  }
  const selectOption = (option: SelectOptions) => {
    if(multiple) {
      if(value.includes(option)){
        onChange(value.filter(o => o !== option))
      }else {
        onChange([...value, option])
      }
    } else {
      if(option !== value) onChange(option)
    }
  }
  const isOptionSelected = (option: SelectOptions) => {
    return multiple ? value.includes(option) : option === value
  }

  useEffect(()=>{
    if(isOpen) setHighlightedIndex(0)
  }, [isOpen])
  
  useEffect(()=>{
    const handler = (e: KeyboardEvent) => {
      if(e.target != containerRef.current) return 
      switch (e.code) {
        case 'Enter':
        case 'Space':
          setIsOpen(prev => !prev)
          if(isOpen) selectOption(options[highlightedIndex])
          break
        case 'ArrowUp':
        case 'ArrowDown':
          if(!isOpen){
            setIsOpen(true)
            break
          }
          const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1)
          if(newValue >= 0 && newValue < options.length){
            setHighlightedIndex(newValue)
          }
          break
        case 'Escape': 
          setIsOpen(false)
          break
        default: 
          return
      }
    }
    containerRef.current?.addEventListener('keydown', handler);

    return ()=>{
    containerRef.current?.removeEventListener('keydown', handler);
    }
  },[isOpen, highlightedIndex, options])

  return (
    <div 
      ref={containerRef}
      onBlur={()=> setIsOpen(false)} 
      onClick={()=> setIsOpen(prev => !prev)} 
      tabIndex={0}
      className={styles.container}
    >
      <span className={styles.value}>
        {multiple ? value.map(v => (
          <button 
            key={v.value} 
            onClick={e => {
              e.stopPropagation();
              selectOption(v);
            }}
            className={styles['option-badge']}
          >
            {v.label}<span className={styles['remove-btn']}>&times;</span>
          </button>
          )) : value?.label}
      </span>
      <button
        onClick={e=> {
          e.stopPropagation()
          clearOption()
        }}
        className={styles['clear-btn']}
      >&times;</button>
      <div className={styles.divider}></div>
      <div className={styles.caret}></div>
      <ul className={`${styles.options} ${isOpen ? styles.show : ''}`}>
        {options.map((option, index) => (
          <li 
            key={ option.value} 
            onClick={e =>{
              e.stopPropagation()
              selectOption(option)
              setIsOpen(false)
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`${styles.option} 
            ${isOptionSelected(option) ? styles.selected : ''}
            ${index === highlightedIndex ? styles.highlighted : ''}`}
          >{option.label}</li>
        ))}
      </ul>
    </div>
  )
}