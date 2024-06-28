const html = document.documentElement
const body = document.body

/** Utils */

class Utils {
  static qs(selector, parent = document) {

    return parent.querySelector(selector)

  }
  static qsa(selector, parent = document) {

    return parent.querySelectorAll(selector)

  }
  static detectClickOutside(div, callback) {

    const clickHandler = e => {
      if (!div.contains(e.target)) {
        callback()
      }
    }

    document.addEventListener('click', clickHandler)

    const removeClickListener = () => {
      document.removeEventListener('click', clickHandler)
    }

    return removeClickListener

  }
}

const qs = Utils.qs
const qsa = Utils.qsa

/** Scroller */

class Scroller {
  constructor () {

    this.class = {
      fix: 'fix',
      reveal: 'reveal'
    }
    this.fixer = 100
    this.pos = 0
    this.elementsToObserve = qsa('[data-reveal]')
    this.each = 200
    this.scrollableDivs = qsa('.scroll-x')

    window.addEventListener('scroll', () => this.fixDetect())

    this.revelAnimation()

  }
  fixDetect () {

    const scrollY = window.scrollY

    if (scrollY > 0) {
      body.classList.add(this.class.fix)
    } else {
      body.classList.remove(this.class.fix)
    }

    this.pos = scrollY

  }
  revelAnimation () {

    const observer = new IntersectionObserver((entries, observer) => {
      let delay = 0
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add(this.class.reveal), delay)
          delay += this.each
          observer.unobserve(entry.target)
        }
      })
    })

    this.elementsToObserve.forEach(element => {
      observer.observe(element)
    })

  }
}

const $Scroller = new Scroller()

/** Header Nav */

class Nav {
  constructor () {

    this.class = {
      open: 'open-nav'
    }

    const header = qs('.header')
    const btnNav = qs('.btn-nav')

    btnNav.addEventListener('click', () => this.toggle())
    Utils.detectClickOutside(header, () => this.close())

  }
  toggle () {
    body.classList.toggle(this.class.open)
  }
  open () {
    body.classList.add(this.class.open)
  }
  close () {
    body.classList.remove(this.class.open)
  }
}

const $Nav = new Nav()

/** If mobile */

const ifMobile = () => {
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp| netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck| ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c| k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50| p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]| c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
      return true
  } else {
      return false
  }
}

if (ifMobile()) {
  html.classList.add('mobile')
}

/** Lenis */

const lenis = new Lenis({
  duration: 1
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

gsap.registerPlugin(ScrollTrigger)
gsap.defaults({
  ease: 'none'
})
gsap.config({
  nullTargetWarn: false
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

/** Motifs */

gsap.fromTo('.motif > *', { y: '0%' }, { y: '25%',
  scrollTrigger: {
    trigger: '.motif',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
})

/** Hero */

gsap.fromTo('.hero-bg', { y: '0%' }, { y: '25%',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
})

/** About */

const about = gsap.timeline({scrollTrigger: {
  trigger: '.about',
  start: 'top bottom',
  end: 'bottom top',
  scrub: true
}})

about
  .fromTo('.about-bg', { y: '-20%' }, { y: '20%' }, 'a')
  .fromTo('.about-word div', { x: '20%' }, { x: '-20%' }, 'a')

/** How */

gsap.fromTo('.how-bg', { y: '-20%' }, { y: '20%',
  scrollTrigger: {
    trigger: '.how',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  }
})

/* Load iframe */

const iframe = qs('#uniswap-iframe')
const iframe_load = ScrollTrigger.create({
  trigger: iframe,
  start: 'top bottom',
  onEnter() {
    iframe.setAttribute('src', iframe.dataset.src)
    iframe.scrollIntoView(false)
    iframe_load.kill()
  }
})

/** Tokenomics */

gsap.fromTo('.token-triangle-svg svg', { width: '0%', opacity: 0 }, { width: '100%', opacity: .5,
  scrollTrigger: {
    trigger: '.token',
    start: 'top 60%',
    end: 'top top',
    scrub: true
  }
})

const circle_timeline = {
  trigger: '.token-triangle-trigger',
  start: 'top bottom',
  end: 'bottom bottom',
  scrub: true
}

const circle = gsap.timeline({ scrollTrigger: circle_timeline })
circle
  .from('.c92', { duration: 60, strokeDasharray: '0 360' })
  .from('.c7', { duration: 30,  strokeDasharray: '0 360' })
  .from('.c1', {  duration: 20, strokeDasharray: '0 360' })

gsap.fromTo('.token-circle-svg', { rotate: 180 }, { duration: 110, rotate: 360, scrollTrigger: circle_timeline })
gsap.from('.token-title text', { y: '100%', scrollTrigger: circle_timeline })

gsap.fromTo('.token-bg', { y: '-20%' }, { y: '20%',
  scrollTrigger: {
    trigger: '.token .bg',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  }
})

gsap.fromTo('.token-triangle', { opacity: 1 }, { opacity: 0,
  scrollTrigger: {
    trigger: '.token .content',
    start: 'top bottom',
    end: 'top 20%',
    scrub: true
  }
})

/** Roadmap */

gsap.fromTo('.road-bg', { y: '-20%' }, { y: '20%',
  scrollTrigger: {
    trigger: '.road',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  }
})
