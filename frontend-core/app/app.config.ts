export default defineAppConfig({
  ui: {
    toast: {
      slots: {
        root: 'ring-transparent relative group overflow-hidden bg-default shadow-[0_0_40px_10px_rgba(0,0,0,0.1)] border-none p-4 flex gap-2.5 focus:outline-none'
      }
    },

    colors: {
      primary: 'primary', // #eb3e7d
      secondary: 'secondary', // #dfa44c
      neutral: 'gray' // Custom gray palette
    },

    icons: {
      search: 'i-bi-search',
      close: 'i-bi-x-lg',
      chevron: 'i-bi-chevron-down',
      ellipsis: 'i-bi-three-dots',
      loading: 'i-bi-arrow-repeat',
      plus: 'i-bi-plus',
      minus: 'i-bi-dash'
    }
  }
})
