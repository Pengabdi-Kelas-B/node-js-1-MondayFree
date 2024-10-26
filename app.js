const fs = require("fs/promises")
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// readline helper
const getInput = title => {
  return new Promise((resolve, reject) => {
    rl.question(title, input => resolve(input));
  });
}

const app = {}

// make folder
app.makeFolder = () => {
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


module.exports = app