import { ref, onMounted, onUnmounted } from 'vue'

const MOBILE = 768
const TABLET = 1024

export function useBreakpoint() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const isMobile = ref(false)
  const isTablet = ref(false)

  function update() {
    width.value = window.innerWidth
    isMobile.value = width.value < MOBILE
    isTablet.value = width.value >= MOBILE && width.value < TABLET
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { width, isMobile, isTablet }
}
