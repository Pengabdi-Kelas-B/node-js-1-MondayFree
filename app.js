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
      await fs.mkdir(__dirname + `/${folderName}`);
      console.log(`Folder ${folderName} berhasil dibuat`);
    } catch(err) {
      console.log(err.code === 'EEXIST' ? 'Folder sudah ada' : err);
    }
    rl.close();
  })
}


// make file
app.makeFile = async () => {
  const rl = createReadLine();
  const getInput = generateGetInput(rl);
  try {
    let extensi = await getInput('Masukan jenis file : ');
    extensi = extensi.trim();  
    if(extensi.includes(" ")) throw new Error("Nama extensi tidak valid");

    let namaFile = await getInput('Masukan nama file : ');
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
  }
  rl.close();
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


module.exports = app