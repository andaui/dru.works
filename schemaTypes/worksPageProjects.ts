import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'worksPageProjects',
  title: 'Works Page Projects',
  type: 'document',
  description: 'Choose and order projects for the /work page: 2-col row, main 70% slot, and grid below. Reorder by dragging.',
  fields: [
    defineField({
      name: 'featuredTwoCol',
      title: 'Featured 2-column row',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'featuredWork' }] }],
      description: 'Two projects shown side by side (50% each). Order = left to right.',
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: 'featuredMain',
      title: 'Featured main (70% width)',
      type: 'reference',
      to: [{ type: 'featuredWork' }],
      description: 'Single project shown at 70% width below the 2-column row.',
    }),
    defineField({
      name: 'gridItems',
      title: 'Grid below',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'featuredWork' }] }],
      description: 'Projects in the grid (first row 2 cols, then 3 per row). Order = drag to reorder.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Works Page Projects', subtitle: '2-col · Main · Grid' }
    },
  },
})
