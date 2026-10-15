'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import { templatesByKind, type TemplateKind } from '../../../../packages/shared/src/template-registry'

/**
 * TemplatePickerField — custom Field bergambar untuk memilih template Header/Footer
 * (Phase 3.24). Menggantikan tampilan `select` biasa dengan grid thumbnail radio.
 * Thumbnail di-serve dari apps/cms/public/admin-thumbs/*.
 *
 * `templateKind` dibaca dari field.admin.custom.templateKind ('header'|'footer').
 */
const TemplatePickerField: React.FC<any> = (props) => {
  const path: string = props?.path ?? props?.field?.name ?? 'template'
  const kind: TemplateKind = props?.field?.admin?.custom?.templateKind ?? 'header'
  const readOnly: boolean = props?.readOnly ?? props?.field?.admin?.readOnly ?? false
  const { value, setValue } = useField<string>({ path })
  const templates = templatesByKind(kind)

  return (
    <div className="field-type" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
        Template ({kind})
      </label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {templates.map((t) => {
          const selected = value === t.templateId
          return (
            <button
              key={t.templateId}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && setValue(t.templateId)}
              title={t.name}
              style={{
                textAlign: 'left',
                cursor: readOnly ? 'not-allowed' : 'pointer',
                opacity: readOnly && !selected ? 0.6 : 1,
                border: selected ? '2px solid var(--theme-success-500, #2e8b57)' : '1px solid var(--theme-elevation-150, #ccc)',
                borderRadius: 8,
                padding: 8,
                background: selected ? 'var(--theme-success-50, #eefaf2)' : 'var(--theme-elevation-0, #fff)',
              }}
            >
              <img
                src={t.thumbnail}
                alt={t.name}
                style={{ width: '100%', height: 'auto', borderRadius: 4, display: 'block', marginBottom: 6 }}
              />
              <div style={{ fontSize: 12, fontWeight: selected ? 700 : 500, lineHeight: 1.3 }}>
                {t.name}
              </div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>{t.templateId}</div>
            </button>
          )
        })}
      </div>
      {readOnly && (
        <p style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
          Hanya Super Admin yang bisa mengganti template.
        </p>
      )}
    </div>
  )
}

export default TemplatePickerField
export { TemplatePickerField }
