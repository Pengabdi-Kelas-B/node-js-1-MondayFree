const fs = require("fs/promises")
const readline = require('node:readline');


// create readline instance
const createReadLine = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}


// readline helper
const generateGetInput = rl => {
  return title => {
    return new Promise((resolve, reject) => {
      rl.question(title, input => resolve(input));
    });
  }
}


// create app
const app = {}


// make folder
app.makeFolder = () => {
  const rl = createReadLine();
  rl.question("Masukan Nama Folder : ", async (folderName) => {
    try {
      if(!folderName.trim()) throw new Error('Nama folder tidak boleh kosong')
      await fs.mkdir(__dirname + `/${folderName}`);
      console.log(`Folder ${folderName} berhasil dibuat`);
    } catch(err) {
      console.log(err.code === 'EEXIST' ? 'Folder sudah ada' : err.message);
    } finally {
      rl.close();
    }
  })
}


// make file
app.makeFile = async () => {
  const rl = createReadLine();
  const getInput = generateGetInput(rl);
  try {
    let extensi = await getInput('Masukan jenis file : ');
    extensi = extensi.trim();  
    if(extensi.includes(" ") || extensi) throw new Error("Nama extensi tidak valid");

    let namaFile = await getInput('Masukan nama file : ');
    if(!namaFile) throw new Error("Nama file tidak valid");
    const unOrganizeFolder = await fs.readdir('unorganize_folder');
    if(unOrganizeFolder.includes(namaFile + "." + extensi)) throw new Error(`File sudah ada di folder unorganize_folder`);
    const root = await fs.readdir('.');
    if(root.includes(extensi)) {
      const typeFolder = await fs.readdir(extensi);
      if(typeFolder.includes(namaFile + "." + extensi)) throw new Error(`File sudah ada di folder ${extensi}`);
    }

    const isi = await getInput("Masukan isi file : ");
    await fs.writeFile(`unorganize_folder/${namaFile}.${extensi}`, isi);

    console.log(`File ${namaFile}.${extensi} berhasil dibuat!`);
  } catch(err) {
    console.log(err.message);
  } finally {
    rl.close();
  }
};


// ext sorter
app.extSorter = async () => {
  try {
    const unOrganizeFolder = await fs.readdir('unorganize_folder');
    if(unOrganizeFolder.length === 0) throw new Error("Tidak ada file di folder unorganize_folder");
    
    for(const file of unOrganizeFolder) {
      const root = await fs.readdir('.');
      let ext = file.split(".");
      ext = ext[ext.length - 1];
      if(!root.includes(ext)) await fs.mkdir(__dirname + `/${ext}`);
      await fs.rename(__dirname + `/unorganize_folder/${file}`, __dirname + `/${ext}/${file}`);
    }

    console.log("Semua file berhasil dirapihkan");
  } catch(err) {
    console.log(err.message);
  }
};


// read folder
app.readFolder = async () => {
  const rl = createReadLine();
  const getInput = generateGetInput(rl);

  try {
    let desiredFolder = await getInput("Masukan nama folder yang dinginkan : ");
    desiredFolder = desiredFolder.trim();
    if(!desiredFolder) throw new Error("Nama Folder tidak boleh kosong");
    const root = await fs.readdir('.');
    if(!root.includes(desiredFolder)) throw new Error("Folder tidak ditemukan");
    const files = await fs.readdir(desiredFolder);
    if(files.length === 0) throw new Error("Tidak ada file di dalam folder");
    let result = [];
    for(const file of files) {
      const fileName = file.split(".");
      const ext = fileName[fileName.length - 1];
      const detail = await fs.stat(__dirname + `/${desiredFolder}/${file}`);
      result.push({
        namaFile: file,
        extensi: ext,
        jenisFile: (ext === 'png' || ext === 'jpg' || ext === 'jpeg') ? 'gambar' : 'text',
        tanggalDibuat: (new Date(detail.birthtime)),
        ukuranFile: detail.size < 1000000 ? `${detail.size} Bytes` : (Math.floor((detail.size / 1000000) * 10) / 10) + ' MB'
      })
    }
    result = result.sort((a, b) => b.tanggalDibuat.getTime() - a.tanggalDibuat.getTime());
    result = result.map(el => {
      el.tanggalDibuat = el.tanggalDibuat.toLocaleString();
      return el;
    });

    console.log(`Berhasil menampilkan isi dari folder ${desiredFolder} :`);
    console.log(result);
  } catch(err) {  
    console.log(err.message);
  } finally {
    rl.close();
  }
};


// read file
app.readFile = async () => {
  const rl = createReadLine();
  const getInput = generateGetInput(rl);

  try {
    let folder = await getInput("Pilih folder : ");
    folder = folder.trim();
    if(!folder) throw new Error("Folder tidak boleh kosong");
    const root = await fs.readdir('.');
    if(!root.includes(folder)) throw new Error("Folder tidak ada");
    
    let file = await getInput("Pilih file : ");
    file = file.trim();
    if(!file) throw new Error("File tidak boleh kosong");
    const targetFolder = await fs.readdir(folder);
    if(!targetFolder.includes(file)) throw new Error("File tidak ada di " + folder);
    let ext = file.split('.');
    ext = ext[ext.length - 1];
    if(ext === 'png' || ext === 'jpg' || ext === 'jpeg') throw new Error(file + ' bukan berupa text');

    const result = (await fs.readFile(`${folder}/${file}`)).toString();
    console.log('Isi dari file ' + file + '\n');
    console.log(result);
  } catch(err) {
    console.log(err.message);
  } finally {
    rl.close();
  }
};


module.exports = app