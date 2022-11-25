<template>
  <div id="app">
    <div>
      <form name>
        <h1
          class="
            mt-4
            text-xl
            font-semibold
            text-center text-gray-800
            capitalize
            lg:text-4xl
            dark:text-white
          "
        >
          Lista de Impresoras
        </h1>

        <div>
          <el-radio-group class="mt-6 space-y-2" v-model="selectedPrinter">
            <div
              v-for="(printer, index) in printerList"
              :key="'printer-' + index"
              @click="selectedPrinter = printer.name"
              class="
                flex
                items-center
                justify-between
                max-w-2xl
                px-8
                py-1
                mx-auto
                border
                cursor-pointer
                rounded-xl
                border-gray-700
              "
            >
                <el-radio :label="printer.name" border class="hidden">
                </el-radio>
              <div class="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    :class="selectedPrinter === printer.name ? 'text-blue-500' : 'text-gray-700'"
                    class="w-5 h-5 sm:h-9 sm:w-9"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    /></svg>
                <div class="flex flex-col items-center mx-5 space-y-1">
                  <h2
                    class="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    {{ printer.name }}
                  </h2>
                </div>
              </div>
              <h2
                class="text-sm font-semibold text-gray-500 dark:text-gray-300"
              >
               {{ printer.options['printer-location'] }}
              </h2>
            </div>
          </el-radio-group>
        </div>
      </form>
    </div>

    <br />
    <input onclick="print()" type="button" value="printer test" />
    <br />
    <br />
    <br />
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      printerList: [],
      selectedPrinter: '',
    };
  },
  mounted() {
    window.ipc.send("READ_PRINTERS");
    window.ipc.on("READ_PRINTERS", (payload) => {
      this.printerList = payload.content;
      this.selectedPrinter = payload.selectedPrinter;
    });
    window.ipc.on("SET_PRINTER", (payload) => {
      if(payload.printer){
        this.$notify({
          title: 'Impresora cambiada',
          message: 'Se ha establecido la impresora ' + payload.printer,
          type: 'success'
        });
      }
    })
  },
  watch: {
    selectedPrinter: {
      handler(newValue) {
        window.ipc.send("SET_PRINTER", newValue);
      },
      deep: true
    }
  },
  methods: {
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
