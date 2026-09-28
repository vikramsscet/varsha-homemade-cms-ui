import { useForm } from 'react-hook-form'

function CategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  pendingLabel,
  apiError,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  const inputClassName = 'w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="max-w-2xl space-y-6 rounded-lg border border-border bg-surface p-5 sm:p-7"
    >
      {apiError && (
        <p className="text-sm text-error" role="alert">
          {apiError}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="category-name" className="block text-sm font-medium text-text">
          Name
        </label>
        <input
          id="category-name"
          type="text"
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'category-name-error' : undefined}
          className={inputClassName}
          {...register('name', {
            validate: {
              required: (value) => value.trim().length > 0 || 'Category name is required.',
              minLength: (value) => value.trim().length >= 2 || 'Category name must be at least 2 characters.',
              maxLength: (value) => value.trim().length <= 100 || 'Category name must be at most 100 characters.',
            },
          })}
        />
        {errors.name && (
          <p id="category-name-error" className="text-sm text-error" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-slug" className="block text-sm font-medium text-text">
          Slug
        </label>
        <input
          id="category-slug"
          type="text"
          autoComplete="off"
          aria-invalid={Boolean(errors.slug)}
          aria-describedby={errors.slug ? 'category-slug-error' : undefined}
          className={inputClassName}
          {...register('slug', {
            required: 'Category slug is required.',
            pattern: {
              value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: 'Use lowercase letters, numbers, and hyphens only.',
            },
          })}
        />
        {errors.slug && (
          <p id="category-slug-error" className="text-sm text-error" role="alert">
            {errors.slug.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-description" className="block text-sm font-medium text-text">
          Description
        </label>
        <textarea
          id="category-description"
          rows={4}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'category-description-error' : undefined}
          className={`${inputClassName} resize-y`}
          {...register('description')}
        />
        {errors.description && (
          <p id="category-description-error" className="text-sm text-error" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-display-order" className="block text-sm font-medium text-text">
          Display Order
        </label>
        <input
          id="category-display-order"
          type="number"
          min="0"
          step="1"
          aria-invalid={Boolean(errors.displayOrder)}
          aria-describedby={errors.displayOrder ? 'category-display-order-error' : undefined}
          className={inputClassName}
          {...register('displayOrder', {
            valueAsNumber: true,
            required: 'Display order is required.',
            min: { value: 0, message: 'Display order must be at least 0.' },
            validate: (value) => Number.isInteger(value) || 'Display order must be a whole number.',
          })}
        />
        {errors.displayOrder && (
          <p id="category-display-order-error" className="text-sm text-error" role="alert">
            {errors.displayOrder.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="category-is-active" className="inline-flex items-center gap-3 text-sm font-medium text-text">
          <input
            id="category-is-active"
            type="checkbox"
            className="size-4 accent-primary"
            {...register('isActive')}
          />
          Active
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default CategoryForm