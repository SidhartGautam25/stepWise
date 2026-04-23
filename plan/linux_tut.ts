/*

linux quest 


1. mkdir projects -> a building name projects will get created
2. cd projects -> enter into the building
3. ls -> list the buildings and apartment inside the building
4. /bin -> list of powers you can use in the building 
5. /tmp -> temporary space , where things can go anytime 
6. /etc -> rules of the world ( law and order of the world )
7. /home -> your hometown ( group of buildings and apartments )



-> name of our world is root
-> bin is set of powers which you can use in the world
-> etc is the collection of rule of the world
-> tmp is part of the world where everything is temporary , can go anywhere
-> rm is used to destroy buildings , apartments and content of the world
-> ls is the name of the buildings and apartments inside the world
-> cd is used to enter into the building
-> mkdir is used to create a new building
-> mkdir inside a building will create a new apartment inside the building
-> cd .. is used to exit from the building
-> touch create a new page that is kept in that room in which it is created
-> cat is used to list down the content of the page
-> echo is used to write something on the page

our world also has one more entity -> workers ( agents )

-> name of the file is name of the page , but extension of the file decides
   what kind of page it is 
-> if the extension of the page is sh , then worker will do what that file has 
   content in it 





*/

/*

Our world is a magical world , in which there are 4 types of things 

-> the user is a caster -> one who cast spells
-> so the command we write is a spell in our magical world
-> /bin -> spell library ( what to do on a specific spell is listed there )
-> /etc -> laws of the world is written here 
-> there are two types of spirit in this magical world
-> guide spirit and summoned spirit
->

*/

/*

there is a magical land named aethera ( root ) , and your soul went there ,
but your ( user ) soul is not alone , as in the land of aethera , a 
soul always gets a guide spirit ( bash process ) as a friend or helper .

the land of aethera has sanctum ( folder ) and codex ( file ) and spell ( command )
the guide spirit remembers few spells ( commands in-built in bash ) but not every spell , 
if the guide spirit remeber the spell told by the soul , then it do the task
whatever told by the soul as a help to a soul ( as soul is his guest )

but if the spell told by the soul is not what guide spirit remembers , 
(spells listed in spell library ( inside /bins)) then guide spirit will go to the 
spell library ( /bin ) and find the spell ,
and then summon a diffrent spirit ( summoned spirit ) and told him to read
the working of the spell and do the task .

mkdir house -> make a sanctum named house
cd house -> guide spirit shift his focus to the house
ls house -> guide spirit will tell the soul what are the things inside the house
touch index.txt -> guide spirit will make a codex named index.txt
echo "hello" > notes.txt -> guide spirit will write "hello" in the codex named notes.txt
echo "hello" >> notes.txt -> guide spirit will append "hello" in the codex named notes.txt
cat index.txt -> guide spirit will read the content of the codex and tell the soul
rm index.txt -> guide spirit will destroy the codex named index.txt
rm -r house -> guide spirit will destroy the sanctum named house and everything inside it


in aethera , codex are of diffrent thing 
-> .sh , .py , .js etc -> these codices can be read by spirits and can do the task
                          written in them
-> .txt , .md -> These Codecs hold readable knowledge, but do not act
-> .conf , or codex inside /etc -> these codices hold the laws of the aethera
-> .log -> these codecs are written by spirits to remember what they did
-> /bin/ -> these codecs are inside spell library , so these codex have the 
            instructions of what to do on a specific spell

so codecs in aethera have a name and a type ( according to extension of the codex )


-> apart from that in the land of aethera , each sanctum and codex has a owner , group
   and a permission thing ( r , w , x )

-> When a soul creates something in Aethera, like a Sanctum or a Codex, it is never born
   empty of rules. The moment it appears, it carries a hidden mark(stores as metadata) 
   inside it. This mark 
   is not written on any page and cannot be seen directly, but it decides everything—who
   can see it, who can change it, and who can enter it. Aethera itself gives every new 
   creation full power at first, but it never leaves things completely open. 
   A silent force, known as the Veil, gently removes some powers before the creation 
   settles into the world.
   So when you create a Sanctum using a spell like mkdir public, Aethera first gives it 
   full openness, but then the Veil steps in and takes away the power for others to change
   it.
   The final mark becomes something like 755, which means the Owner Soul has full control
   , while other souls may only enter and see, but not change anything. In the same way,
    when a Codex is created, it is given a slightly different starting power, and the 
    Veil shapes it so that others may read it, but only the Owner can change it.
    This hidden mark is guided by the Laws of Aethera. These laws define three simple 
    powers: Sight, Ink, and Passage. Sight lets a soul read or see. Ink lets a soul 
    change things. Passage lets a soul enter or activate. Every Sanctum and Codex quietly 
    checks this mark whenever a spirit tries to act. No spirit reads it like a book—they 
    simply feel it and know what is allowed.
    If a soul does not have Passage, the gates of a Sanctum stay closed. If it does not 
    have Sight, the words inside a Codex do not appear. And if it does not have Ink, any
    change they try to make fades away instantly. These rules are not enforced by the 
    Guide Spirit or any summoned spirit. They are part of Aethera itself. 













*/