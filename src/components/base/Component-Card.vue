<template>
    <div class="card" :class="[computedClass, cardClass]" :style="{ width, height, ...cardStyle }">
        <div class="card-header sombra">
            <h2 class="card-title" :class="titleClass">
                <slot name="title">Default Title</slot>
            </h2>
            <h4 class="">
                <slot name="nav-menu">Default Subtitle</slot>
            </h4>
        </div>
        <div class="card-body" :class="bodyClass">
            <slot name="body">Default Body Content</slot>
        </div>
        <div class="card-footer" :class="footerClass">
            <slot name="footer-left">Default Footer</slot>
            <!-- <slot name="footer-center">Default Footer</slot> -->
            <slot name="footer-right">Default Footer</slot>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    cardClass: String,
    titleClass: String,
    bodyClass: String,
    footerClass: String,
    cardStyle: {
        type: Object,
        default: () => ({}),
    },
    theme: {
        type: String,
        default: 'light',
    },
    width: {
        type: String,
        default: '350px',
    },
    height: {
        type: String,
        default: '350px',
    },
})
const computedClass = computed(() => `card card--${props.theme}`)
</script>

<style lang="sass" scoped>
@use '../../assets/sass/_mixin' as mixins

.card
    display: flex
    flex-direction: column
    justify-content: start
    background: #f3f3f3
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5)
    transition: all 0.3s ease-in-out
    width: 100vw !important
    height: 98vh !important
    @include mixins.phone
        // background-color: red !important
        height: 100vh !important

.card-header
    padding: 0px 0px
    background-color: #fff
    border-bottom: 1px solid #ddd
    @include mixins.phone
        // background-color: blue !important
        // max-height: 30px
        // padding: 0px 0px
        // border-bottom: 1px solid #ddd


.card-title
    // border: 1px solid red
    text-align: center
    @include mixins.phone
        font-size: 100px !important

.card-body
    flex-grow: 1
    // padding: 15px
    @include mixins.phone
        padding: 0px 0px

.card-footer
    display: flex
    justify-content: space-between
    padding: 10px 15px
    border-top: 1px solid #ddd
    font-style: italic
    font-size: 12px
.card--light
    background: #f3f3f3
.card--dark
    background: #2c2c2c
    color: #fff
.card--primary
    background: #007bff
    color: #fff
</style>
