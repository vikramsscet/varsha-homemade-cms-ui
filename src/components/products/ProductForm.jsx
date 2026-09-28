import { useEffect, useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'

const currencies = [{ value: 'INR', label: 'INR - Indian Rupee' }]
const statuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED']
const emptyDescription = { type: 'doc', content: [{ type: 'paragraph' }] }

function hasDescriptionText(node) {
  if (typeof node?.text === 'string' && node.text.trim()) return true
  return Array.isArray(node?.content) && node.content.some(hasDescriptionText)
}

function DescriptionEditor({ value, onChange, onBlur, error }) {
  const editorId = useId()
  const editor = useEditor({
    extensions: [StarterKit],
    content: value ?? emptyDescription,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getJSON()),
    onBlur,
    editorProps: {
      attributes: {
        id: editorId,
        'aria-label': 'Description',
        'aria-multiline': 'true',
      },
    },
  })

  useEffect(() => {
    if (!editor || !value) return
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  const toolbarButtonClass = (active) =>
    `grid size-8 place-items-center rounded text-sm font-medium transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-primary ${active ? 'bg-primary/10 text-primary' : 'text-muted'}`

  return (
    <div className={`overflow-hidden rounded-md border bg-surface ${error ? 'border-error' : 'border-border'}`}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2" aria-label="Description formatting">
        <button
          type="button"
          onClick={() => editor?.chain().focus().setParagraph().run()}
          disabled={!editor}
          aria-label="Paragraph"
          title="Paragraph"
          className="rounded px-2 py-1.5 text-xs font-medium text-muted hover:bg-background disabled:opacity-50"
        >
          Paragraph
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          aria-label="Bold"
          aria-pressed={editor?.isActive('bold') ?? false}
          title="Bold"
          className={toolbarButtonClass(editor?.isActive('bold'))}
        >
          <Bold size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          aria-label="Italic"
          aria-pressed={editor?.isActive('italic') ?? false}
          title="Italic"
          className={toolbarButtonClass(editor?.isActive('italic'))}
        >
          <Italic size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor}
          aria-label="Bullet list"
          aria-pressed={editor?.isActive('bulletList') ?? false}
          title="Bullet list"
          className={toolbarButtonClass(editor?.isActive('bulletList'))}
        >
          <List size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
          aria-label="Numbered list"
          aria-pressed={editor?.isActive('orderedList') ?? false}
          title="Numbered list"
          className={toolbarButtonClass(editor?.isActive('orderedList'))}
        >
          <ListOrdered size={16} aria-hidden="true" />
        </button>
      </div>
      <label htmlFor={editorId} className="sr-only">Description</label>
      <EditorContent
        editor={editor}
        className="min-h-40 px-3 py-2.5 text-sm text-text outline-none [&_.ProseMirror]:min-h-36 [&_.ProseMirror]:outline-none [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6"
      />
      {error && (
        <p className="px-3 pb-2 text-sm text-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}

function ProductForm({
  initialValues,
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
  onCancel,
  onSubmit,
  apiError,
  mode = 'create',
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      subtitle: '',
      description: emptyDescription,
      price: '',
      currency: 'INR',
      packageSize: '',
      categoryId: '',
      status: 'DRAFT',
      isFeatured: false,
      isAvailable: true,
      displayOrder: 1,
      ...initialValues,
    },
  })
  const canSubmit = !categoriesLoading && !categoriesError && categories.length > 0

  useEffect(() => {
    const categoryId = initialValues?.categoryId
    if (
      mode === 'edit' &&
      !categoriesLoading &&
      !categoriesError &&
      categories.some((category) => category.id === categoryId)
    ) {
      setValue('categoryId', categoryId, { shouldValidate: true })
    }
  }, [categories, categoriesError, categoriesLoading, initialValues?.categoryId, mode, setValue])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="max-w-4xl space-y-6 rounded-lg border border-border bg-surface p-5 sm:p-7"
    >
      {apiError && <p className="text-sm text-error" role="alert">{apiError}</p>}

      <div className="space-y-2">
        <label htmlFor="product-title" className="block text-sm font-medium text-text">Title</label>
        <input
          id="product-title"
          type="text"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'product-title-error' : undefined}
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          {...register('title', {
            validate: {
              required: (value) => value.trim().length > 0 || 'Product title is required.',
              minLength: (value) => value.trim().length >= 2 || 'Title must be at least 2 characters.',
              maxLength: (value) => value.length <= 200 || 'Title must be at most 200 characters.',
            },
          })}
        />
        {errors.title && <p id="product-title-error" className="text-sm text-error" role="alert">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="product-slug" className="block text-sm font-medium text-text">Slug</label>
        <input
          id="product-slug"
          type="text"
          aria-invalid={Boolean(errors.slug)}
          aria-describedby={errors.slug ? 'product-slug-error' : undefined}
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          {...register('slug', {
            required: 'Product slug is required.',
            pattern: {
              value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: 'Use lowercase letters, numbers, and hyphens only.',
            },
          })}
        />
        {errors.slug && <p id="product-slug-error" className="text-sm text-error" role="alert">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="product-subtitle" className="block text-sm font-medium text-text">Subtitle</label>
        <input
          id="product-subtitle"
          type="text"
          aria-invalid={Boolean(errors.subtitle)}
          aria-describedby={errors.subtitle ? 'product-subtitle-error' : undefined}
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          {...register('subtitle', { maxLength: { value: 200, message: 'Subtitle must be at most 200 characters.' } })}
        />
        {errors.subtitle && <p id="product-subtitle-error" className="text-sm text-error" role="alert">{errors.subtitle.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">Description</label>
        <Controller
          name="description"
          control={control}
          rules={{ validate: (value) => hasDescriptionText(value) || 'Product description is required.' }}
          render={({ field, fieldState }) => (
            <DescriptionEditor
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error}
            />
          )}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="product-price" className="block text-sm font-medium text-text">Price</label>
          <input
            id="product-price"
            type="number"
            min="0"
            step="any"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? 'product-price-error' : undefined}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            {...register('price', {
              valueAsNumber: true,
              required: 'Price is required.',
              min: { value: 0, message: 'Price must be at least 0.' },
              validate: (value) => Number.isFinite(value) || 'Enter a valid price.',
            })}
          />
          {errors.price && <p id="product-price-error" className="text-sm text-error" role="alert">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="product-currency" className="block text-sm font-medium text-text">Currency</label>
          <select
            id="product-currency"
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            {...register('currency', { required: 'Currency is required.' })}
          >
            <option value="">Select currency</option>
            {currencies.map((currency) => (
              <option key={currency.value} value={currency.value}>{currency.label}</option>
            ))}
          </select>
          {errors.currency && <p className="text-sm text-error" role="alert">{errors.currency.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="product-package-size" className="block text-sm font-medium text-text">Package Size</label>
          <input
            id="product-package-size"
            type="text"
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            {...register('packageSize')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="product-category" className="block text-sm font-medium text-text">Category</label>
          <select
            id="product-category"
            disabled={!canSubmit}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={errors.categoryId ? 'product-category-error' : undefined}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            {...register('categoryId', {
              validate: (value) => categories.some((category) => category.id === value) || 'Select a valid category.',
            })}
          >
            <option value="">
              {categoriesLoading ? 'Loading categories...' : 'Select a category'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          {categoriesError && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-error" role="alert">Unable to load categories.</p>
              <button type="button" onClick={onRetryCategories} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                Retry
              </button>
            </div>
          )}
          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <p className="text-sm text-muted">No categories available.</p>
          )}
          {errors.categoryId && <p id="product-category-error" className="text-sm text-error" role="alert">{errors.categoryId.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="product-status" className="block text-sm font-medium text-text">Status</label>
          <select
            id="product-status"
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            {...register('status', { required: 'Status is required.' })}
          >
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="product-display-order" className="block text-sm font-medium text-text">Display Order</label>
          <input
            id="product-display-order"
            type="number"
            min="0"
            step="1"
            aria-invalid={Boolean(errors.displayOrder)}
            aria-describedby={errors.displayOrder ? 'product-display-order-error' : undefined}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            {...register('displayOrder', {
              valueAsNumber: true,
              required: 'Display order is required.',
              min: { value: 0, message: 'Display order must be at least 0.' },
              validate: (value) => Number.isInteger(value) || 'Display order must be a whole number.',
            })}
          />
          {errors.displayOrder && <p id="product-display-order-error" className="text-sm text-error" role="alert">{errors.displayOrder.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <label htmlFor="product-is-available" className="inline-flex items-center gap-3 text-sm font-medium text-text">
          <input id="product-is-available" type="checkbox" className="size-4 accent-primary" {...register('isAvailable')} />
          Available
        </label>
        <label htmlFor="product-is-featured" className="inline-flex items-center gap-3 text-sm font-medium text-text">
          <input id="product-is-featured" type="checkbox" className="size-4 accent-primary" {...register('isFeatured')} />
          Featured
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Product')}
        </button>
      </div>
    </form>
  )
}

export default ProductForm