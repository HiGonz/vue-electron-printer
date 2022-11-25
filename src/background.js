/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict'

import { app, protocol, BrowserWindow, dialog, net } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import axios from 'axios'
const {PosPrinter} = require("electron-pos-printer");
import moment from 'moment'

axios.defaults.baseURL = 'http://localhost:3333/api/v2/'
axios.defaults.headers.common['accept-encoding'] = '*'

const isDevelopment = process.env.NODE_ENV !== 'production'

const Store = require('electron-store');

const schema = {
	printerName: {
		type: 'string',
		default: 'POS-80C'
	}
};

const store = new Store({schema});

const formatCurrency = (value) => {
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}



const path = require('path');

const { ipcMain } = require('electron');

let win

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('xticket-printer', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('xticket-printer')
}

ipcMain.on('READ_PRINTERS', (event) => {
  const content = win.webContents.getPrinters();
  const selectedPrinter = store.get('printerName');
  event.reply('READ_PRINTERS', { content, selectedPrinter });
});

ipcMain.on('SET_PRINTER', (event, printer) => {
  store.set('printerName', printer);
  event.reply('SET_PRINTER', { printer });
});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // __static is set by webpack and will point to the public directory
      preload: path.resolve(__static, 'preload.js'),
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

}



// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_, argv) => {
    console.log(`Instance lock triggered`);
    if (argv.length > 1) {
      // Only try this if there is an argv (might be redundant)
      if (process.platform == "win32" || process.platform === "linux") {
        try {
          console.log(
            `Direct link to file - SUCCESS: ${argv[1]}`,
          );
          const protocolUrl = argv[argv.length-1];
          // protocol xticket-printer://type=string&data=jsonString
          const protocolData = protocolUrl.split('://')[1];
          const protocolType = protocolData.split('&')[0].split('=')[1];
          const protocolJson = protocolData.split('&')[1].split('=')[1];
          console.log({protocolType, protocolJson});
          console.log(data)

          switch (type) {
            case 'sale':
              if (data) {
                  const options = {
                    preview: true,
                    margin: '0 0 0 0',
                    copies: 2,
                    printerName: store.get('printerName'),
                    timeOutPerLine: 1500,
                    pageSize: '80mm',
                    silent: true
                  }
                  const folios = data.folios[0]
                  const via = data.via
                    const data = [
                      {
                          type: 'image',
                          url: 'https://pos.xticket.com.mx/images/black_logo_ticket.png',     // file path
                          position: 'center',                                  // position of image: 'left' | 'center' | 'right'
                          width: '200px',                                           // width of image in px; default: auto
                          height: '60px',                                          // width of image in px; default: 50 or '50px'
                      },{
                          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                          value: 'UN PRODUCTO DE',
                          style: {textAlign: 'center', fontSize: "14px", marginTop: "12px"},
                      },{
                         type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
                          value: 'FEELING MUSIC MÉXICO',
                          style: {fontSize: "20px", textAlign: "center", fontWeight: "700"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: 'Carretera Torreón Matamoros 6540, Gustavo',
                        style: {textAlign: 'center', fontSize: "12px"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: 'Díaz Ordaz 27279',
                        style: {textAlign: 'center', fontSize: "12px"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: 'Torreón, Coahuila de Zaragoza, Mexico',
                        style: {textAlign: 'center', fontSize: "12px"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: '----------------------------------------',
                        style: {textAlign: 'center', fontSize: "12px", color: "white"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: 'Evento: ' + sale.tickets[0].area.event.show.title,
                        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: 'Cliente: ' + (sale.customer[0]?sale.customer[0].user.first_name + ' ' + sale.customer[0].user.last_name + ' ' + sale.customer[0].id:''),
                        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
                      },
                      {
                          type: 'table',
                          // list of the columns to be rendered in the table header
                          tableHeader: ['Folio', 'Area', 'Precio'],
                          // multi dimensional array depicting the rows and columns of the table body
                          tableBody: sale.tickets.map((ticket) => {
                            return [ticket.id, ticket.area.area.name, formatCurrency(ticket.price)];
                          }),
                          // list of columns to be rendered in the table footer
                          tableFooter: [sale.tickets.length, ' boletos ventidos', formatCurrency(sale.tickets.reduce((a, b) => a + b.price, 0))],
                          // custom style for the table header
                          tableHeaderStyle: { borderBottom: '1px solid #000000', fontSize: '14px', fontWeight: 'bold' },
                          // custom style for the table body
                          tableBodyStyle: { borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', fontSize: '14px' },
                          // custom style for the table footer
                          tableFooterStyle: { borderTop: '1px solid #000000', fontSize: '14px', fontWeight: 'bold' },
                          // custom style for the table row
                          style: { textAlign: 'center', width: '98%' },
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: 'MUCHAS GRACIAS POR SU COMPRA',
                        style: {textAlign: 'center', fontSize: "14px"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: 'NO SE ACEPTAN DEVOLUCIONES NI CAMBIOS, CUALQUIER DUDA O RECLAMACION COMUNICARSE AL 871 358 2153',
                        style: {textAlign: 'center', fontSize: "14px"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: '871 358 2153',
                        style: {textAlign: 'center', fontSize: "14px"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: 'HTTP://WWW.XTICKET.COM.MX',
                        style: {textAlign: 'center', fontSize: "14px", marginTop: "10px", marginBottom: "20px"}
                      },
                      {
                        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
                        value: '.',
                        style: {textAlign: 'center', fontSize: "10px", marginTop: "15px"}
                      },
                  ]

                    PosPrinter.print(data, options)
                      .then(console.log(data))
                      .catch((error) => {
                         console.error({error});
                       });
                  }
              break;
            case 'ticket':
              axios.get(`https://api.xticket.com.mx/api/v2/ticket-customers/${id}`).then((response) => {
                const ticket = response.data;
                console.log(ticket)
          }).catch((error) => {
            console.log(error)
          });
              break;
            default:
              break;
          }
        } catch {
          console.log(
            `Direct link to file - FAILED: ${argv}`,
          );
        }
      }
    }
  })
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

app.on('open-url', (event, url) => {
  dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
})
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
