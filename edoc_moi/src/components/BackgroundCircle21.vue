<!-- <template>
    <div
      class="absolute bg-cover bg-center z-0 w-screen h-screen"
      style="background-image: url('/src/assets/img/bg.png')"
    ></div>
  </template> -->
  
  <template>
    <div
      class="absolute bg-cover bg-center z-0 w-screen h-screen"
      :style="{ backgroundImage: 'url(' + bg + ')' }"
    ></div>
  </template>
  <script setup lang="ts">
    import bg from "@/assets/img/bg.png"
  </script>
<style>
</style>