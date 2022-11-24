<template>
  <div id="app">
       <h1>Test printer</h1>
    Node.js <span id="node-version"></span> - 
    Chromium <span id="chrome-version"></span> - 
    Electron <span id="electron-version"></span>.
	
	<div>
	
	<form name>
  <p>List of printers:</p>
  
  <el-radio-group v-model="selectedPrinter">
    <el-radio v-for="(printer, index) in printerList" :key="'printer-'+index" :label="index">{{ printer.displayName }}</el-radio>
  </el-radio-group>

  <br>  

  <p>Width</p>
  <input type="radio" id="w1" name="width" value="140px">
  <label for="w1">140px</label><br>
  
  <input type="radio" id="w2" name="width" value="170px">
  <label for="w2">170px</label><br>
  
  <input type="radio" id="w3" name="width" value="200px">
  <label for="w3">200px</label><br>
  
  <input type="radio" id="w4" name="width" value="250px">
  <label for="w4">250px</label><br>
  
  <input type="radio" id="w5" name="width" value="300px">
  <label for="w5">300px</label><br>
  
 
</form>
	
	</div>
	
	<br>
<input onclick="print()" type="button" value="printer test"/>
<br>
<br>
<br>
  </div>
</template>
<script>
export default {
  name: 'App',
  data () {
    return {
      printerList: [],
      selectedPrinter: 0
    }
  },
  mounted(){
    window.ipc.send('READ_PRINTERS');
    window.ipc.on('READ_PRINTERS', (payload) => {
      this.printerList = payload.content;
    });
  },
  methods: {
  },
}
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
