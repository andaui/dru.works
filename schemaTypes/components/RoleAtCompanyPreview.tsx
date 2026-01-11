import React from 'react'
import {useFormValue} from 'sanity'

export function RoleAtCompanyPreview(props: any) {
  const role = useFormValue(['role']) as string | undefined
  const company = useFormValue(['company']) as string | undefined
  
  const formatted = role && company ? `${role} at ${company}` : 'Enter Role and Company to see preview'
  
  return (
    <div style={{padding: '1rem', background: '#f5f5f5', borderRadius: '4px', marginTop: '0.5rem'}}>
      <div style={{fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem'}}>
        Preview:
      </div>
      <div style={{fontSize: '0.875rem', color: '#666'}}>
        {formatted}
      </div>
    </div>
  )
}

