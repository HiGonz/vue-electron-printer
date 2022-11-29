/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict'

import { app, protocol, BrowserWindow, dialog, Tray, nativeImage, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const {PosPrinter} = require("electron-pos-printer");
import moment from 'moment'
const { autoUpdater } = require('electron-updater');

autoUpdater.requestHeaders = { "PRIVATE-TOKEN": "glpat-_w2dxuKz3ZzBz3fUZmzR" };
autoUpdater.autoDownload = true;

autoUpdater.setFeedURL({
    provider: "generic",
    url: "http://gitlab.com/api/v4/projects/41372921/jobs/artifacts/master/raw/dist/?job=build"
});

autoUpdater.on('checking-for-update', function () {
    sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', function (info) {
    sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', function (info) {
    sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', function (err) {
    sendStatusToWindow('Error in auto-updater.');
});

autoUpdater.on('download-progress', function (progressObj) {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + parseInt(progressObj.percent) + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', function (info) {
    sendStatusToWindow('Update downloaded; will install in 1 seconds');
});

autoUpdater.on('update-downloaded', function (info) {
    setTimeout(function () {
        autoUpdater.quitAndInstall();
    }, 1000);
});

const isDevelopment = process.env.NODE_ENV !== 'production'

const Store = require('electron-store');

const schema = {
	printerName: {
		type: 'string',
		default: 'POS-80C'
	}
};

const store = new Store({schema});

let tray = null
function createTray () {
  const icon = path.join(__static, 'printer.png') // required.
  const trayicon = nativeImage.createFromPath(icon)
  tray = new Tray(trayicon.resize({ width: 16 }))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Configuración',
      click: () => {
        createWindow()
      }
    },
    {
      label: 'Cerrar',
      click: () => {
        app.quit() // actually quit the app.
      }
    },
  ])

  tray.setContextMenu(contextMenu)
}

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

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  if (!tray) {
    createTray()
  }
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

  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

}



// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
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
          const url = protocolUrl.replace('xticket-printer://', '');
          // type=sale&data=%7B%22folios%22:[[4776]],%22via%22:%22SMS%22,%22member%22:%7B%22status%22:201,%22user%22:%7B%22id%22:22,%22first_name%22:%22Hiram%22,%22last_name%22:%22Gonz%C3%A1lez%22,%22phone_number%22:%22+52%20871%20141%205072%22,%22email%22:%22hiramglz92@gmail.com%22,%22email_verified%22:%22false%22,%22created_at%22:%222022-08-13%2012:32:40%22,%22updated_at%22:%222022-09-15%2017:49:04%22,%22token%22:null,%22status%22:1%7D,%22customer%22:%7B%22id%22:4,%22created_at%22:%222022-08-13%2012:32:40%22,%22updated_at%22:%222022-08-13%2012:32:40%22,%22user_id%22:22%7D%7D,%22area%22:%22General%22,%22eventTitle%22:%22Baile%20Romance%20y%20Adios%20al%202022%22,%22eventAlias%22:%22Los%20Yonic's%20Zamacona%20Jr.%22,%22total%22:300,%22subtotal%22:300,%22commission%22:0,%22descuento%22:0,%22phone_number%22:null%7D/
          const urlParams = new URLSearchParams(url);
          const type = urlParams.get('type');
          // parse data remove last slash
          const dataPrint = JSON.parse(urlParams.get('data').slice(0, -1));
          if(type === 'saleSMS') {
            printSMS(type, dataPrint);
          } else if(type === 'saleEMAIL') {
            printEmail(type, dataPrint);
          } else if(type === 'saleTicket') {
            printSale(type, dataPrint);
          }
          
        } catch(error) {
          console.log(
            `Direct link to file - FAILED: ${error.message}`,
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

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded');
});

function printSMS(type, dataPrint) {
  const options = {
    preview: false,
    margin: '0 0 0 0',
    copies: 2,
    printerName: store.get('printerName'),
    timeOutPerLine: 1500,
    pageSize: '80mm',
    silent: true

  }
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
        value: 'Evento: ' + dataPrint.eventTitle + (dataPrint.eventAlias? ' - ' + dataPrint.eventAlias:''),
        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Cliente: ' + (dataPrint.member?dataPrint.member.user.first_name + ' ' + dataPrint.member.user.last_name + ' ' + dataPrint.member.customer.id:''),
        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
      },
      {
          type: 'table',
          // list of the columns to be rendered in the table header
          tableHeader: ['Folio', 'Area', 'Precio'],
          // multi dimensional array depicting the rows and columns of the table body
          tableBody: dataPrint.tickets.map((ticket) => {
            return [ticket.id, dataPrint.area, ticket.price];
          }),
          // list of columns to be rendered in the table footer
          tableFooter: [dataPrint.tickets.length, ' boletos ventidos', formatCurrency(dataPrint.total)],
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
        value: 'LOS BOLETOS HAN SIDO ENVIADOS A SU TELEFONO',
        style: {textAlign: 'center', fontSize: "14px", fontWeight: "700"}
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
      .then()
      .catch((error) => {
         console.error({error});
       });
}

function printEmail(type, dataPrint) {
  const options = {
    preview: false,
    margin: '0 0 0 0',
    copies: 2,
    printerName: store.get('printerName'),
    timeOutPerLine: 1500,
    pageSize: '80mm',
    silent: true
  }
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
        value: 'Evento: ' + dataPrint.eventTitle + (dataPrint.eventAlias? ' - ' + dataPrint.eventAlias:''),
        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Cliente: ' + (dataPrint.member?dataPrint.member.user.first_name + ' ' + dataPrint.member.user.last_name + ' ' + dataPrint.member.customer.id:''),
        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
      },
      {
          type: 'table',
          // list of the columns to be rendered in the table header
          tableHeader: ['Folio', 'Area', 'Precio'],
          // multi dimensional array depicting the rows and columns of the table body
          tableBody: dataPrint.tickets.map((ticket) => {
            return [ticket.id, dataPrint.area, ticket.price];
          }),
          // list of columns to be rendered in the table footer
          tableFooter: [dataPrint.tickets.length, ' boletos ventidos', formatCurrency(dataPrint.total)],
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
        value: 'LOS BOLETOS HAN SIDO ENVIADOS A SU CORREO ELECTRONICO',
        style: {textAlign: 'center', fontSize: "14px", fontWeight: "700"}
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
      .then()
      .catch((error) => {
         console.error({error});
       });
}

async function printSale(type, dataPrint) {
  const options = {
    preview: false,
    margin: '0 0 0 0',
    copies: 2,
    printerName: store.get('printerName'),
    timeOutPerLine: 1500,
    pageSize: '80mm',
    silent: true
  }
  let promise = new Promise(function(resolve, reject){
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
        value: 'Evento: ' + dataPrint.eventTitle + (dataPrint.eventAlias? ' - ' + dataPrint.eventAlias:''),
        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Cliente: ' + (dataPrint.member?dataPrint.member.user.first_name + ' ' + dataPrint.member.user.last_name + ' ' + dataPrint.member.customer.id:''),
        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
      }]
    if(dataPrint.booking) {
      data.push({
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Mesa: ' + dataPrint.mesa,
        style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
      },
    )
    }
    data.push(
      {
          type: 'table',
          // list of the columns to be rendered in the table header
          tableHeader: ['Folio', 'Area', 'Precio'],
          // multi dimensional array depicting the rows and columns of the table body
          tableBody: dataPrint.tickets.map((ticket) => {
            return [ticket.id, dataPrint.area, ticket.price];
          }),
          // list of columns to be rendered in the table footer
          tableFooter: [dataPrint.tickets.length, ' boletos ventidos', formatCurrency(dataPrint.total)],
          // custom style for the table header
          tableHeaderStyle: { borderBottom: '1px solid #000000', fontSize: '14px', fontWeight: 'bold' },
          // custom style for the table body
          tableBodyStyle: { borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', fontSize: '14px' },
          // custom style for the table footer
          tableFooterStyle: { borderTop: '1px solid #000000', fontSize: '14px', fontWeight: 'bold' },
          // custom style for the table row
          style: { textAlign: 'center', width: '98%' },
      })
      if(!dataPrint.debtPayment){
        data.push({
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: '----------------------------------------',
          style: {textAlign: 'center', fontSize: "12px", color: "white"}
        },
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'LOS BOLETOS HAN SIDO IMPRESOS',
          style: {textAlign: 'center', fontSize: "14px", fontWeight: "700"}
        },
      )
      } else{
        data.push({
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: '----------------------------------------',
          style: {textAlign: 'center', fontSize: "12px", color: "white"}
        },
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'AUN DEBE: $' + (dataPrint.total - dataPrint.payment).toFixed(2),
          style: {textAlign: 'center', fontSize: "14px"}
        },
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'Condicion del abono: Los boletos deben ser liquidados 15 dias antes de la fecha del evento:',
          style: {textAlign: 'center', fontSize: "14px"}
        },
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'Su proximo abono sera en la fecha: ' + moment(dataPrint.dateNextDebt).format('DD/MM/YYYY'),
          style: {textAlign: 'center', fontSize: "14px", fontWeight: "700"}
        }
      )  
      }
      data.push(
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
      )
      
      resolve(data)
});

function setIntervalLimited(callback, interval, x) {

  for (var i = 0; i < x; i++) {
      setTimeout(callback, i * interval);
  }

}
    promise.then((data) => {
      setIntervalLimited(function () {
        PosPrinter.print(data, options)
      .then()
      .catch((error) => {
         console.error({error});
       });
    }, 500, 2);
    }).then(() => {
      if(!dataPrint.debtPayment){
        for (const ticket of dataPrint.tickets) {
          let dataTicket = [];
          dataTicket.push(
            {
              type: 'image',
              url: 'https://pos.xticket.com.mx/images/black_logo_ticket.png',     // file path
              position: 'center',                                  // position of image: 'left' | 'center' | 'right'
              width: '200px',                                           // width of image in px; default: auto
              height: '60px',                                          // width of image in px; default: 50 or '50px'
          },
          {
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
          value: 'Evento: ' + dataPrint.eventTitle + (dataPrint.eventAlias? ' - ' + dataPrint.eventAlias:''),
          style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
        },
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'Cliente: ' + (dataPrint.member?dataPrint.member.user.first_name + ' ' + dataPrint.member.user.last_name + ' ' + dataPrint.member.customer.id:''),
          style: {textAlign: 'left', fontSize: "14px", marginLeft: "12px"}
        },
        {
          type: 'qrCode',
          value: ticket.sku,
          height: 190,
          width: 190,
          style: { margin: '0 0 0 100px' }
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
          })
    
          setIntervalLimited(function () {
            PosPrinter.print(dataTicket, options)
      .then()
      .catch((error) => {
         console.error({error});
       })
        }, 500, 1);
      }
       }
    })
}