## requirement : user login

1. sebagai user atau employee, saya ingin login ke aplikasi client dari sso menggunakan nip dan password, sehingga saya hanya perlu login sekali untuk mengakses semua aplikasi

## acceptance criteria

1. ketika membuka halaman aplikasi yang terdaftar di idp, maka akan diarahkan ke halaman login idp
2. ketika user memasukkan nip dan password yang valid, maka user akan diarahkan ke halaman aplikasi client
3. ketika user memasukkan nip dan password yang tidak valid, maka akan muncul pesan error

## requirement : user melihat list aplikasi client

1. sebagai user yang telah login, saya ingin bisa melihat seluruh aplikasi yang terdaftar di idp, sehingga saya bisa memilih aplikasi yang ingin saya akses

## acceptance criteria

1. ketika berhasil login, user bisa melihat seluruh aplikasi client idp yang aktif dan terdaftar
2. dari idp, backend akan tau role permission dari user. jika user tidak punya akses ke asebuah aplikasi yang diklik, maka tampilkan popup error
3. berikan menu profile user, ketika user klik menu tersebut maka akan menampilkan profile dari user yang sedang mengakses
4. ketika user mengklik logout, maka user akan diarahkan ke halaman login idp

## requirement: admin client management

1. sebagai admin, saya ingin bisa mengelola client idp, sehingga saya bisa menambah, mengubah, dan menghapus client idp

## acceptance criteria

1. admin bisa menambah client idp
2. admin bisa mengubah client idp
3. admin bisa menghapus client idp

## requirement: admin client role permission

1. sebagai admin, saya ingin bisa mengelola role permission dari setiap client idp, sehingga saya bisa menentukan role mana yang bisa mengakses client idp

## acceptance criteria

1. admin bisa menambah role permission client idp
2. admin bisa mengubah role permission client idp
3. admin bisa menghapus role permission client idp

## requirement: user register client

1. sebagai admin, saya bisa menambahkan employee kedalam client idp yang sudah terdaftar, sehingga employee bisa mengakses client idp tersebut
2. saya bisa melihat list employee yang terdaftar di client idp

## acceptance criteria

1. admin bisa menambah employee ke client idp
2. admin bisa menghapus employee dari client idp
3. admin bisa melihat list employee yang terdaftar di client idp

## requirement: jabatan management

1. sebagai admin, saya ingin bisa mengelola jabatan, sehingga saya bisa menambah, mengubah, dan menghapus jabatan

## acceptance criteria

1. admin bisa menambah jabatan
2. admin bisa mengubah jabatan
3. admin bisa menghapus jabatan

## requirement: user/employee jabatan management

1. sebagai admin, saya ingin bisa mengelola jabatan employee, sehingga saya bisa menambah, mengubah, dan menghapus jabatan employee

## acceptance criteria

1. admin bisa menambah jabatan employee
2. admin bisa mengubah jabatan employee
3. admin bisa menghapus jabatan employee

## requirement: user/employee role override management

1. sebagai admin, saya ingin bisa mengelola role override dari setiap employee, sehingga saya bisa menentukan role mana yang bisa mengakses client idp

## acceptance criteria

1. admin bisa menambah role override employee
2. admin bisa mengubah role override employee
3. admin bisa menghapus role override employee

## requirement: user/employee role mapping management

1. sebagai admin, saya ingin bisa mengelola role mapping dari setiap employee, sehingga saya bisa menentukan role mana yang bisa mengakses client idp

## acceptance criteria

1. admin bisa menambah role mapping employee
2. admin bisa mengubah role mapping employee
3. admin bisa menghapus role mapping employee

## requirement: user/employee profile

1. sebagai user, saya ingin bisa melihat profile saya

## acceptance criteria

1. user bisa melihat profile user
2. user tidak bisa mengubah profile user

## requirement: user/employee profile edit

1. sebagai user, saya ingin bisa mengedit profile saya
2. sebagai admin, saya bisa mengedit profile employee

## acceptance criteria

1. user bisa mengedit profile user
2. admin bisa mengedit profile employee
