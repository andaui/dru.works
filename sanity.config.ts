import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'dru.works',

  projectId: 'ta8jx0n4',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Homepage Work')
              .child(S.document().schemaType('homepageWork').documentId('homepageWork')),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => item.getId() !== 'homepageWork'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
