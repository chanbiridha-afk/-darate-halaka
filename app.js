/* ============================================================
   المدرسة النموذجية النهضة بالقرآن الكريم — منصة إدارة الحلقة
   (سكربت عادي وليس module حتى تعمل معالجات onclick المضمّنة
    مع أدوات الحالة العلوية؛ الوحدات المعتمدة على Firebase تُحمَّل
    ديناميكيًا عبر import() غير المتزامن)
   ============================================================ */
let AuthApi, Store;
/* ===== حلقة — منطق التطبيق ===== */

const SURAHS = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
"هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
"الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
"لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
"فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
"الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
"الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
"نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
"التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
"الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
"القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
"المسد","الإخلاص","الفلق","الناس"];

// عدد آيات كل سورة برواية ورش عن نافع (العدّ المدني الأخير المعتمد في مصحف مجمع الملك فهد لطباعة المصحف الشريف برواية ورش)
// الترتيب مطابق لمصفوفة SURAHS أعلاه (من الفاتحة إلى الناس) — الإجمالي 6214 آية
const AYAH_COUNTS = [
  7,285,200,175,122,167,206,76,130,109,
  121,111,44,54,99,128,110,105,99,134,
  111,76,119,62,77,226,95,88,69,59,
  33,30,73,54,46,82,182,86,72,84,
  53,50,89,56,36,34,39,29,18,45,
  60,47,61,55,77,99,28,21,24,13,
  14,11,11,18,12,12,31,52,52,44,
  30,28,18,55,39,31,50,40,45,42,
  29,19,36,25,22,17,19,26,32,20,
  15,21,11,8,8,20,5,8,9,11,
  10,8,3,9,5,5,6,3,6,3,
  5,4,5,6
];

function ayahCountForSurah(surahName){
  const idx = SURAHS.indexOf(surahName);
  return idx>=0 ? AYAH_COUNTS[idx] : 286;
}
function ayahOptions(surahName, selected){
  const max = ayahCountForSurah(surahName);
  let opts = "";
  const sel = String(selected||"1");
  for(let i=1;i<=max;i++){
    opts += `<option value="${i}" ${String(i)===sel?'selected':''}>${i}</option>`;
  }
  return opts;
}
function getByPath(path){
  const parts = path.split(".");
  let o = sessionDraft;
  for(const p of parts) o = o[p];
  return o;
}
function updSurahRange(prefix, which, value){
  const o = getByPath(prefix);
  o["surah"+which] = value;
  o["ayah"+which] = 1;
  render();
}

// ===================== الأربعون النووية =====================
// نص متن الأربعين النووية (٤٢ حديثًا) كما هو مستقر في أشهر طبعاته المعتمدة على أصول الإمام النووي
const HADITH40 = [
  {n:1, narrator:"عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه", text:"قال: سمعت رسول الله صلى الله عليه وسلم يقول: «إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه».", takhrij:"رواه البخاري ومسلم"},
  {n:2, narrator:"عن عمر بن الخطاب رضي الله عنه", text:"قال: بينما نحن جلوس عند رسول الله صلى الله عليه وسلم ذات يوم، إذ طلع علينا رجل شديد بياض الثياب، شديد سواد الشعر، لا يرى عليه أثر السفر ولا يعرفه منا أحد، حتى جلس إلى النبي صلى الله عليه وسلم، فأسند ركبتيه إلى ركبتيه، ووضع كفيه على فخذيه، وقال: يا محمد أخبرني عن الإسلام. فقال رسول الله صلى الله عليه وسلم: «الإسلام أن تشهد أن لا إله إلا الله وأن محمدًا رسول الله، وتقيم الصلاة، وتؤتي الزكاة، وتصوم رمضان، وتحج البيت إن استطعت إليه سبيلًا»... ثم سأله عن الإيمان والإحسان وأمارات الساعة، ثم انطلق، فقال النبي صلى الله عليه وسلم: «هذا جبريل أتاكم يعلمكم دينكم».", takhrij:"رواه مسلم"},
  {n:3, narrator:"عن أبي عبد الرحمن عبد الله بن عمر بن الخطاب رضي الله عنهما", text:"قال: سمعت رسول الله صلى الله عليه وسلم يقول: «بُني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمدًا رسول الله، وإقام الصلاة، وإيتاء الزكاة، وحج البيت، وصوم رمضان».", takhrij:"رواه البخاري ومسلم"},
  {n:4, narrator:"عن أبي عبد الرحمن عبد الله بن مسعود رضي الله عنه", text:"قال: حدثنا رسول الله صلى الله عليه وسلم، وهو الصادق المصدوق: «إن أحدكم يجمع خلقه في بطن أمه أربعين يومًا نطفة، ثم يكون علقة مثل ذلك، ثم يكون مضغة مثل ذلك، ثم يرسل إليه الملك فينفخ فيه الروح، ويؤمر بأربع كلمات: بكتب رزقه، وأجله، وعمله، وشقي أو سعيد...».", takhrij:"رواه البخاري ومسلم"},
  {n:5, narrator:"عن أم المؤمنين أم عبد الله عائشة رضي الله عنها", text:"قالت: قال رسول الله صلى الله عليه وسلم: «من أحدث في أمرنا هذا ما ليس منه فهو رد». وفي رواية لمسلم: «من عمل عملًا ليس عليه أمرنا فهو رد».", takhrij:"رواه البخاري ومسلم"},
  {n:6, narrator:"عن أبي عبد الله النعمان بن بشير رضي الله عنهما", text:"قال: سمعت رسول الله صلى الله عليه وسلم يقول: «إن الحلال بيّن وإن الحرام بيّن، وبينهما أمور مشتبهات لا يعلمهن كثير من الناس، فمن اتقى الشبهات فقد استبرأ لدينه وعرضه، ومن وقع في الشبهات وقع في الحرام... ألا وإن لكل ملك حمى، ألا وإن حمى الله محارمه، ألا وإن في الجسد مضغة إذا صلحت صلح الجسد كله، وإذا فسدت فسد الجسد كله، ألا وهي القلب».", takhrij:"رواه البخاري ومسلم"},
  {n:7, narrator:"عن أبي رقية تميم بن أوس الداري رضي الله عنه", text:"أن النبي صلى الله عليه وسلم قال: «الدين النصيحة». قلنا: لمن؟ قال: «لله، ولكتابه، ولرسوله، ولأئمة المسلمين وعامتهم».", takhrij:"رواه مسلم"},
  {n:8, narrator:"عن ابن عمر رضي الله عنهما", text:"أن رسول الله صلى الله عليه وسلم قال: «أُمرت أن أقاتل الناس حتى يشهدوا أن لا إله إلا الله وأن محمدًا رسول الله، ويقيموا الصلاة، ويؤتوا الزكاة، فإذا فعلوا ذلك عصموا مني دماءهم وأموالهم إلا بحق الإسلام، وحسابهم على الله تعالى».", takhrij:"رواه البخاري ومسلم"},
  {n:9, narrator:"عن أبي هريرة عبد الرحمن بن صخر رضي الله عنه", text:"قال: سمعت رسول الله صلى الله عليه وسلم يقول: «ما نهيتكم عنه فاجتنبوه، وما أمرتكم به فأتوا منه ما استطعتم؛ فإنما أهلك الذين من قبلكم كثرة مسائلهم واختلافهم على أنبيائهم».", takhrij:"رواه البخاري ومسلم"},
  {n:10, narrator:"عن أبي هريرة رضي الله عنه", text:"قال: قال رسول الله صلى الله عليه وسلم: «إن الله تعالى طيب لا يقبل إلا طيبًا، وإن الله أمر المؤمنين بما أمر به المرسلين، فقال: {يَا أَيُّهَا الرُّسُلُ كُلُوا مِنَ الطَّيِّبَاتِ وَاعْمَلُوا صَالِحًا}، وقال: {يَا أَيُّهَا الَّذِينَ آمَنُوا كُلُوا مِنْ طَيِّبَاتِ مَا رَزَقْنَاكُمْ}. ثم ذكر الرجل يطيل السفر أشعث أغبر، يمد يديه إلى السماء: يا رب، يا رب! ومطعمه حرام، ومشربه حرام، وملبسه حرام، وغذي بالحرام، فأنى يستجاب لذلك؟».", takhrij:"رواه مسلم"},
  {n:11, narrator:"عن أبي محمد الحسن بن علي بن أبي طالب رضي الله عنهما سبط رسول الله صلى الله عليه وسلم وريحانته", text:"قال: حفظت من رسول الله صلى الله عليه وسلم: «دع ما يريبك إلى ما لا يريبك».", takhrij:"رواه الترمذي والنسائي، وقال الترمذي: حديث حسن صحيح"},
  {n:12, narrator:"عن أبي هريرة رضي الله عنه", text:"قال: قال رسول الله صلى الله عليه وسلم: «من حسن إسلام المرء تركه ما لا يعنيه».", takhrij:"حديث حسن، رواه الترمذي وغيره"},
  {n:13, narrator:"عن أبي حمزة أنس بن مالك رضي الله عنه خادم رسول الله صلى الله عليه وسلم", text:"عن النبي صلى الله عليه وسلم قال: «لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه».", takhrij:"رواه البخاري ومسلم"},
  {n:14, narrator:"عن ابن مسعود رضي الله عنه", text:"قال: قال رسول الله صلى الله عليه وسلم: «لا يحل دم امرئ مسلم يشهد أن لا إله إلا الله وأني رسول الله إلا بإحدى ثلاث: الثيب الزاني، والنفس بالنفس، والتارك لدينه المفارق للجماعة».", takhrij:"رواه البخاري ومسلم"},
  {n:15, narrator:"عن أبي هريرة رضي الله عنه", text:"أن رسول الله صلى الله عليه وسلم قال: «من كان يؤمن بالله واليوم الآخر فليقل خيرًا أو ليصمت، ومن كان يؤمن بالله واليوم الآخر فليكرم جاره، ومن كان يؤمن بالله واليوم الآخر فليكرم ضيفه».", takhrij:"رواه البخاري ومسلم"},
  {n:16, narrator:"عن أبي هريرة رضي الله عنه", text:"أن رجلًا قال للنبي صلى الله عليه وسلم: أوصني. قال: «لا تغضب». فردد مرارًا، قال: «لا تغضب».", takhrij:"رواه البخاري"},
  {n:17, narrator:"عن أبي يعلى شداد بن أوس رضي الله عنه", text:"عن رسول الله صلى الله عليه وسلم قال: «إن الله كتب الإحسان على كل شيء، فإذا قتلتم فأحسنوا القتلة، وإذا ذبحتم فأحسنوا الذبح، وليحد أحدكم شفرته، وليرح ذبيحته».", takhrij:"رواه مسلم"},
  {n:18, narrator:"عن أبي ذر جندب بن جنادة، وأبي عبد الرحمن معاذ بن جبل رضي الله عنهما", text:"عن رسول الله صلى الله عليه وسلم قال: «اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن».", takhrij:"رواه الترمذي وقال: حديث حسن، وفي بعض النسخ: حسن صحيح"},
  {n:19, narrator:"عن أبي العباس عبد الله بن عباس رضي الله عنهما", text:"قال: كنت خلف النبي صلى الله عليه وسلم يومًا فقال: «يا غلام إني أعلمك كلمات: احفظ الله يحفظك، احفظ الله تجده تجاهك، إذا سألت فاسأل الله، وإذا استعنت فاستعن بالله، واعلم أن الأمة لو اجتمعت على أن ينفعوك بشيء لم ينفعوك إلا بشيء قد كتبه الله لك، وإن اجتمعوا على أن يضروك بشيء لم يضروك إلا بشيء قد كتبه الله عليك، رفعت الأقلام وجفت الصحف».", takhrij:"رواه الترمذي وقال: حديث حسن صحيح"},
  {n:20, narrator:"عن أبي مسعود عقبة بن عمرو الأنصاري البدري رضي الله عنه", text:"قال: قال النبي صلى الله عليه وسلم: «إن مما أدرك الناس من كلام النبوة الأولى: إذا لم تستحِ فاصنع ما شئت».", takhrij:"رواه البخاري"},
  {n:21, narrator:"عن أبي عمرو، وقيل أبي عمرة سفيان بن عبد الله رضي الله عنه", text:"قال: قلت: يا رسول الله، قل لي في الإسلام قولًا لا أسأل عنه أحدًا غيرك. قال: «قل: آمنت بالله، ثم استقم».", takhrij:"رواه مسلم"},
  {n:22, narrator:"عن أبي عبد الله جابر بن عبد الله الأنصاري رضي الله عنهما", text:"أن رجلًا سأل رسول الله صلى الله عليه وسلم: أرأيت إذا صليت المكتوبات، وصمت رمضان، وأحللت الحلال، وحرمت الحرام، ولم أزد على ذلك شيئًا، أأدخل الجنة؟ قال: «نعم».", takhrij:"رواه مسلم"},
  {n:23, narrator:"عن أبي مالك الحارث بن عاصم الأشعري رضي الله عنه", text:"قال: قال رسول الله صلى الله عليه وسلم: «الطهور شطر الإيمان، والحمد لله تملأ الميزان، وسبحان الله والحمد لله تملآن -أو: تملأ- ما بين السماوات والأرض، والصلاة نور، والصدقة برهان، والصبر ضياء، والقرآن حجة لك أو عليك، كل الناس يغدو، فبائع نفسه فمعتقها أو موبقها».", takhrij:"رواه مسلم"},
  {n:24, narrator:"عن أبي ذر رضي الله عنه", text:"عن النبي صلى الله عليه وسلم فيما روى عن الله تبارك وتعالى أنه قال: «يا عبادي إني حرمت الظلم على نفسي وجعلته بينكم محرمًا فلا تظالموا... يا عبادي إنما هي أعمالكم أحصيها لكم ثم أوفيكم إياها، فمن وجد خيرًا فليحمد الله، ومن وجد غير ذلك فلا يلومن إلا نفسه».", takhrij:"رواه مسلم"},
  {n:25, narrator:"عن أبي ذر رضي الله عنه", text:"أن ناسًا من أصحاب النبي صلى الله عليه وسلم قالوا للنبي صلى الله عليه وسلم: يا رسول الله، ذهب أهل الدثور بالأجور... فقال: «أوليس قد جعل الله لكم ما تصدقون؟ إن بكل تسبيحة صدقة، وكل تكبيرة صدقة، وكل تحميدة صدقة، وكل تهليلة صدقة، وأمر بالمعروف صدقة، ونهي عن منكر صدقة، وفي بضع أحدكم صدقة».", takhrij:"رواه مسلم"},
  {n:26, narrator:"عن أبي هريرة رضي الله عنه", text:"عن النبي صلى الله عليه وسلم قال: «كل سلامى من الناس عليه صدقة، كل يوم تطلع فيه الشمس: تعدل بين اثنين صدقة، وتعين الرجل في دابته فتحمله عليها أو ترفع له عليها متاعه صدقة، والكلمة الطيبة صدقة، وبكل خطوة تمشيها إلى الصلاة صدقة، وتميط الأذى عن الطريق صدقة».", takhrij:"رواه البخاري ومسلم"},
  {n:27, narrator:"عن النواس بن سمعان رضي الله عنه", text:"عن النبي صلى الله عليه وسلم قال: «البر حسن الخلق، والإثم ما حاك في صدرك وكرهت أن يطلع عليه الناس».", takhrij:"رواه مسلم"},
  {n:28, narrator:"عن أبي نجيح العرباض بن سارية رضي الله عنه", text:"قال: وعظنا رسول الله صلى الله عليه وسلم موعظة وجلت منها القلوب وذرفت منها العيون، فقلنا: يا رسول الله كأن هذه موعظة مودع فأوصنا. قال: «أوصيكم بتقوى الله والسمع والطاعة وإن تأمر عليكم عبد، فإنه من يعش منكم فسيرى اختلافًا كثيرًا، فعليكم بسنتي وسنة الخلفاء الراشدين المهديين، عضوا عليها بالنواجذ، وإياكم ومحدثات الأمور فإن كل بدعة ضلالة».", takhrij:"رواه أبو داود والترمذي وقال: حديث حسن صحيح"},
  {n:29, narrator:"عن معاذ بن جبل رضي الله عنه", text:"قال: قلت: يا رسول الله أخبرني بعمل يدخلني الجنة ويباعدني من النار. قال: «رأس الأمر الإسلام، وعموده الصلاة، وذروة سنامه الجهاد في سبيل الله»، ثم قال: «ألا أخبرك بملاك ذلك كله؟» قلت: بلى يا رسول الله. فأخذ بلسانه وقال: «كف عليك هذا». قلت: يا نبي الله وإنا لمؤاخذون بما نتكلم به؟ فقال: «ثكلتك أمك، وهل يكب الناس في النار على وجوههم -أو على مناخرهم- إلا حصائد ألسنتهم».", takhrij:"رواه الترمذي وقال: حديث حسن صحيح"},
  {n:30, narrator:"عن أبي ثعلبة الخشني رضي الله عنه", text:"عن رسول الله صلى الله عليه وسلم قال: «إن الله تعالى فرض فرائض فلا تضيعوها، وحد حدودًا فلا تعتدوها، وحرم أشياء فلا تنتهكوها، وسكت عن أشياء رحمة لكم غير نسيان فلا تبحثوا عنها».", takhrij:"حديث حسن رواه الدارقطني وغيره"},
  {n:31, narrator:"عن أبي العباس سهل بن سعد الساعدي رضي الله عنه", text:"قال: جاء رجل إلى النبي صلى الله عليه وسلم فقال: يا رسول الله، دلني على عمل إذا عملته أحبني الله وأحبني الناس. فقال: «ازهد في الدنيا يحبك الله، وازهد فيما عند الناس يحبك الناس».", takhrij:"حديث حسن رواه ابن ماجه وغيره"},
  {n:32, narrator:"عن أبي سعيد سعد بن مالك بن سنان الخدري رضي الله عنه", text:"أن رسول الله صلى الله عليه وسلم قال: «لا ضرر ولا ضرار».", takhrij:"حديث حسن رواه ابن ماجه والدارقطني وغيرهما"},
  {n:33, narrator:"عن ابن عباس رضي الله عنهما", text:"أن رسول الله صلى الله عليه وسلم قال: «لو يعطى الناس بدعواهم لادعى رجال أموال قوم ودماءهم، لكن البينة على المدعي واليمين على من أنكر».", takhrij:"حديث حسن رواه البيهقي وغيره"},
  {n:34, narrator:"عن أبي سعيد الخدري رضي الله عنه", text:"قال: سمعت رسول الله صلى الله عليه وسلم يقول: «من رأى منكم منكرًا فليغيره بيده، فإن لم يستطع فبلسانه، فإن لم يستطع فبقلبه، وذلك أضعف الإيمان».", takhrij:"رواه مسلم"},
  {n:35, narrator:"عن أبي هريرة رضي الله عنه", text:"قال: قال رسول الله صلى الله عليه وسلم: «لا تحاسدوا، ولا تناجشوا، ولا تباغضوا، ولا تدابروا، ولا يبع بعضكم على بيع بعض، وكونوا عباد الله إخوانًا، المسلم أخو المسلم، لا يظلمه، ولا يخذله، ولا يكذبه، ولا يحقره... التقوى هاهنا -ويشير إلى صدره ثلاث مرات- بحسب امرئ من الشر أن يحقر أخاه المسلم، كل المسلم على المسلم حرام: دمه وماله وعرضه».", takhrij:"رواه مسلم"},
  {n:36, narrator:"عن أبي هريرة رضي الله عنه", text:"عن النبي صلى الله عليه وسلم قال: «من نفس عن مؤمن كربة من كرب الدنيا نفس الله عنه كربة من كرب يوم القيامة، ومن يسر على معسر يسر الله عليه في الدنيا والآخرة، ومن ستر مسلمًا ستره الله في الدنيا والآخرة، والله في عون العبد ما كان العبد في عون أخيه...».", takhrij:"رواه مسلم"},
  {n:37, narrator:"عن ابن عباس رضي الله عنهما", text:"عن رسول الله صلى الله عليه وسلم فيما يرويه عن ربه تبارك وتعالى قال: «إن الله كتب الحسنات والسيئات، ثم بين ذلك: فمن هم بحسنة فلم يعملها كتبها الله له عنده حسنة كاملة، فإن هم بها فعملها كتبها الله له عشر حسنات... ومن هم بسيئة فلم يعملها كتبها الله له عنده حسنة كاملة، فإن هم بها فعملها كتبها الله سيئة واحدة».", takhrij:"رواه البخاري ومسلم"},
  {n:38, narrator:"عن أبي هريرة رضي الله عنه", text:"عن النبي صلى الله عليه وسلم قال: «إن الله قال: من عادى لي وليًا فقد آذنته بالحرب، وما تقرب إلي عبدي بشيء أحب إلي مما افترضته عليه، ولا يزال عبدي يتقرب إلي بالنوافل حتى أحبه، فإذا أحببته كنت سمعه الذي يسمع به، وبصره الذي يبصر به، ويده التي يبطش بها، ورجله التي يمشي بها، وإن سألني لأعطينه، ولئن استعاذني لأعيذنه».", takhrij:"رواه البخاري"},
  {n:39, narrator:"عن ابن عباس رضي الله عنهما", text:"أن رسول الله صلى الله عليه وسلم قال: «إن الله تجاوز لي عن أمتي الخطأ والنسيان وما استكرهوا عليه».", takhrij:"حديث حسن رواه ابن ماجه والبيهقي وغيرهما"},
  {n:40, narrator:"عن ابن عمر رضي الله عنهما", text:"قال: أخذ رسول الله صلى الله عليه وسلم بمنكبي فقال: «كن في الدنيا كأنك غريب أو عابر سبيل». وكان ابن عمر يقول: إذا أمسيت فلا تنتظر الصباح، وإذا أصبحت فلا تنتظر المساء، وخذ من صحتك لمرضك، ومن حياتك لموتك.", takhrij:"رواه البخاري"},
  {n:41, narrator:"عن أبي محمد عبد الله بن عمرو بن العاص رضي الله عنهما", text:"قال: قال رسول الله صلى الله عليه وسلم: «لا يؤمن أحدكم حتى يكون هواه تبعًا لما جئت به».", takhrij:"حديث حسن صحيح، رويناه في كتاب الحجة بإسناد صحيح"},
  {n:42, narrator:"عن أنس بن مالك رضي الله عنه", text:"قال: سمعت رسول الله صلى الله عليه وسلم يقول: قال الله تعالى: «يا ابن آدم، إنك ما دعوتني ورجوتني غفرت لك على ما كان منك ولا أبالي، يا ابن آدم لو بلغت ذنوبك عنان السماء ثم استغفرتني غفرت لك، يا ابن آدم إنك لو أتيتني بقراب الأرض خطايا ثم لقيتني لا تشرك بي شيئًا لأتيتك بقرابها مغفرة».", takhrij:"رواه الترمذي وقال: حديث حسن صحيح"}
];
function hadithByNumber(n){ return HADITH40.find(h=>h.n===Number(n)) || HADITH40[0]; }

// ===================== الأذكار (أبواب الأذكار مع دليل كل ذكر) =====================
// مبنية على أبواب "متن الأذكار" المتداولة (أذكار مأثورة من القرآن والسنة الصحيحة)
const ADHKAR = [
  {bab:"دعاء الاستيقاظ من النوم", dhikr:"الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور.", daleel:"عن حذيفة وأبي ذر رضي الله عنهما أن النبي صلى الله عليه وسلم كان إذا أخذ مضجعه من الليل قال: «باسمك اللهم أموت وأحيا»، وإذا استيقظ قال: «الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور». رواه البخاري."},
  {bab:"دعاء لبس الثوب", dhikr:"الحمد لله الذي كساني هذا (الثوب) ورزقنيه من غير حول مني ولا قوة.", daleel:"عن معاذ بن أنس رضي الله عنه أن النبي صلى الله عليه وسلم قال: «من لبس ثوبًا فقال: الحمد لله الذي كساني هذا ورزقنيه من غير حول مني ولا قوة، غفر له ما تقدم من ذنبه». رواه أبو داود والترمذي، وقال: حديث حسن غريب."},
  {bab:"دعاء دخول الخلاء", dhikr:"بسم الله، اللهم إني أعوذ بك من الخبث والخبائث.", daleel:"عن أنس بن مالك رضي الله عنه قال: كان النبي صلى الله عليه وسلم إذا دخل الخلاء قال: «اللهم إني أعوذ بك من الخبث والخبائث». متفق عليه، وزيادة البسملة عند دخوله رويت من فعل الصحابة وبوَّب عليها أهل العلم."},
  {bab:"دعاء الخروج من الخلاء", dhikr:"غفرانك.", daleel:"عن عائشة رضي الله عنها قالت: كان النبي صلى الله عليه وسلم إذا خرج من الخلاء قال: «غفرانك». رواه أبو داود والترمذي وقال: حديث حسن غريب."},
  {bab:"أذكار الوضوء", dhikr:"قبله: بسم الله. وبعده: أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمدًا عبده ورسوله، اللهم اجعلني من التوابين واجعلني من المتطهرين.", daleel:"عن أبي هريرة رضي الله عنه مرفوعًا: «لا وضوء لمن لم يذكر اسم الله عليه». رواه أبو داود وأحمد. وعن عمر بن الخطاب رضي الله عنه أن النبي صلى الله عليه وسلم قال: «ما منكم من أحد يتوضأ فيسبغ الوضوء ثم يقول: أشهد أن لا إله إلا الله وأن محمدًا عبده ورسوله، إلا فتحت له أبواب الجنة الثمانية يدخل من أيها شاء». رواه مسلم."},
  {bab:"دعاء الذهاب إلى المسجد", dhikr:"اللهم اجعل في قلبي نورًا، وفي لساني نورًا، واجعل في سمعي نورًا، وفي بصري نورًا، واجعل من خلفي نورًا، ومن أمامي نورًا، واجعل من فوقي نورًا، ومن تحتي نورًا، اللهم أعطني نورًا.", daleel:"عن ابن عباس رضي الله عنهما أن النبي صلى الله عليه وسلم كان يقول عند خروجه إلى الصلاة بهذا الدعاء. متفق عليه."},
  {bab:"دعاء دخول المسجد", dhikr:"أعوذ بالله العظيم، وبوجهه الكريم، وسلطانه القديم، من الشيطان الرجيم، اللهم افتح لي أبواب رحمتك.", daleel:"عن عبد الله بن عمرو رضي الله عنهما أن النبي صلى الله عليه وسلم كان إذا دخل المسجد قال ذلك، وقال: إذا قال ذلك قال الشيطان: حُفظ مني سائر اليوم. رواه أبو داود. وعن أبي حميد أو أبي أسيد رضي الله عنهما مرفوعًا: «إذا دخل أحدكم المسجد فليقل: اللهم افتح لي أبواب رحمتك». رواه مسلم."},
  {bab:"دعاء الخروج من المسجد", dhikr:"اللهم إني أسألك من فضلك.", daleel:"عن أبي حميد أو أبي أسيد رضي الله عنهما أن النبي صلى الله عليه وسلم قال: «وإذا خرج فليقل: اللهم إني أسألك من فضلك». رواه مسلم."},
  {bab:"الأذكار بعد السلام من الصلاة المكتوبة", dhikr:"أستغفر الله (ثلاثًا)، اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام. ثم: سبحان الله (٣٣)، والحمد لله (٣٣)، والله أكبر (٣٤)، ثم: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.", daleel:"عن ثوبان رضي الله عنه قال: كان رسول الله صلى الله عليه وسلم إذا انصرف من صلاته استغفر ثلاثًا وقال: اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام. رواه مسلم. وعن أبي هريرة رضي الله عنه في حديث التسبيح دبر كل صلاة. رواه مسلم."},
  {bab:"من أذكار الصباح", dhikr:"أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير. اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور. مع قراءة آية الكرسي والمعوذتين ثلاث مرات.", daleel:"عن عبد الله بن مسعود رضي الله عنه أن النبي صلى الله عليه وسلم كان إذا أصبح قال هذا الذكر. رواه مسلم. وعن أبي هريرة رضي الله عنه مرفوعًا في فضل قراءة آية الكرسي وقت الصباح. رواه النسائي بإسناد صحيح."},
  {bab:"من أذكار المساء", dhikr:"أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير. اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.", daleel:"عن عبد الله بن مسعود رضي الله عنه أن النبي صلى الله عليه وسلم كان إذا أمسى قال هذا الذكر. رواه مسلم."},
  {bab:"سيد الاستغفار", dhikr:"اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت.", daleel:"عن شداد بن أوس رضي الله عنه عن النبي صلى الله عليه وسلم قال: «سيد الاستغفار أن يقول العبد...» ثم ذكره، وقال: «من قالها من النهار موقنًا بها فمات من يومه قبل أن يمسي فهو من أهل الجنة، ومن قالها من الليل وهو موقن بها فمات قبل أن يصبح فهو من أهل الجنة». رواه البخاري."},
  {bab:"دعاء عند الطعام", dhikr:"بسم الله، فإن نسي في أوله فليقل: بسم الله في أوله وآخره.", daleel:"عن عائشة رضي الله عنها عن النبي صلى الله عليه وسلم قال: «إذا أكل أحدكم فليذكر اسم الله تعالى، فإن نسي أن يذكر اسم الله تعالى في أوله فليقل: بسم الله أوله وآخره». رواه أبو داود والترمذي."},
  {bab:"دعاء بعد الفراغ من الطعام", dhikr:"الحمد لله الذي أطعمني هذا، ورزقنيه من غير حول مني ولا قوة.", daleel:"عن أبي سعيد الخدري رضي الله عنه أن النبي صلى الله عليه وسلم قال: «من أكل طعامًا فقال: الحمد لله الذي أطعمني هذا ورزقنيه من غير حول مني ولا قوة، غُفر له ما تقدم من ذنبه». رواه أبو داود والترمذي."},
  {bab:"دعاء الخروج من المنزل", dhikr:"بسم الله، توكلت على الله، ولا حول ولا قوة إلا بالله.", daleel:"عن أنس بن مالك رضي الله عنه أن النبي صلى الله عليه وسلم قال: «إذا خرج الرجل من بيته فقال: بسم الله توكلت على الله، ولا حول ولا قوة إلا بالله، يقال له: هُديت وكُفيت ووُقيت، وتنحى عنه الشيطان». رواه أبو داود والترمذي والنسائي."},
  {bab:"دعاء دخول المنزل", dhikr:"بسم الله ولجنا، وبسم الله خرجنا، وعلى ربنا توكلنا، ثم يسلم على أهله.", daleel:"عن أبي مالك الأشعري رضي الله عنه عن النبي صلى الله عليه وسلم قال: «إذا ولج الرجل بيته فليقل: اللهم إني أسألك خير المولج وخير المخرج، بسم الله ولجنا، وبسم الله خرجنا، وعلى الله ربنا توكلنا، ثم ليسلم على أهله». رواه أبو داود."},
  {bab:"دعاء ركوب السيارة أو الدابة", dhikr:"الله أكبر (ثلاثًا)، سبحان الذي سخر لنا هذا وما كنا له مقرنين، وإنا إلى ربنا لمنقلبون.", daleel:"عن ابن عمر رضي الله عنهما أن النبي صلى الله عليه وسلم كان إذا استوى على بعيره خارجًا إلى سفر كبّر ثلاثًا ثم قال هذا الدعاء، اقتداءً بقوله تعالى: {سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ}. رواه مسلم وأبو داود والترمذي."},
  {bab:"دعاء السفر", dhikr:"الله أكبر، الله أكبر، الله أكبر، سبحان الذي سخر لنا هذا وما كنا له مقرنين، وإنا إلى ربنا لمنقلبون. اللهم إنا نسألك في سفرنا هذا البر والتقوى، ومن العمل ما ترضى...", daleel:"عن ابن عمر رضي الله عنهما أن رسول الله صلى الله عليه وسلم كان إذا سافر يدعو بهذا الدعاء عند ركوبه، وفيه: «اللهم إنا نسألك في سفرنا هذا البر والتقوى، ومن العمل ما ترضى، اللهم هون علينا سفرنا هذا واطو عنا بعده...». رواه مسلم."},
  {bab:"دعاء النوم", dhikr:"باسمك اللهم أموت وأحيا. مع قراءة آية الكرسي، والمعوذتين، وسورة الإخلاص، والآيتين الأخيرتين من سورة البقرة.", daleel:"عن حذيفة رضي الله عنه أن النبي صلى الله عليه وسلم كان إذا أخذ مضجعه من الليل وضع يده تحت خده ثم قال: «باسمك اللهم أموت وأحيا». رواه البخاري. وعن أبي هريرة رضي الله عنه في فضل آية الكرسي عند النوم. رواه البخاري. وعن ابن مسعود رضي الله عنه مرفوعًا في فضل الآيتين الأخيرتين من سورة البقرة: «من قرأهما في ليلة كفتاه». متفق عليه."},
  {bab:"دعاء الاستيقاظ من الليل والفزع فيه", dhikr:"لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، سبحان الله والحمد لله ولا إله إلا الله والله أكبر ولا حول ولا قوة إلا بالله، اللهم اغفر لي.", daleel:"عن عبادة بن الصامت رضي الله عنه عن النبي صلى الله عليه وسلم: «من تعار من الليل فقال: لا إله إلا الله وحده لا شريك له... ثم قال: اللهم اغفر لي، أو دعا، استجيب له». رواه البخاري."},
  {bab:"دعاء الكرب والهم", dhikr:"لا إله إلا الله العظيم الحليم، لا إله إلا الله رب العرش العظيم، لا إله إلا الله رب السماوات ورب الأرض ورب العرش الكريم.", daleel:"عن ابن عباس رضي الله عنهما أن النبي صلى الله عليه وسلم كان يقول عند الكرب هذا الدعاء. متفق عليه."},
];
function adhkarByBab(babName){ return ADHKAR.find(a=>a.bab===babName) || ADHKAR[0]; }

const TAJWEED_DETAILS = [
  {key:"makharij", label:"نقص في المخارج والصفات"},
  {key:"ikhtilas", label:"اختلاس في الحركات"},
  {key:"mudud", label:"نقص في المدود"},
  {key:"ghunnah", label:"نقص في الغنة"},
  {key:"nunSakinah", label:"أحكام النون الساكنة والتنوين"},
  {key:"mimSakinah", label:"أحكام الميم الساكنة"},
];

// ===================== الجلسات =====================
function surahRangeLabel(o){
  if(!o || !o.surahFrom) return "—";
  const a = `${o.surahFrom} (${o.ayahFrom||'?'})`;
  const b = (o.surahTo && o.surahTo!==o.surahFrom) ? ` إلى ${o.surahTo} (${o.ayahTo||'?'})` : (o.ayahTo? ` - ${o.ayahTo}`:'');
  return a+b;
}

function evalChip(val, kind){
  if(!val) return '<span class="chip chip-mid">—</span>';
  const map = {
    "جيد":"chip-good", "جيدة":"chip-good",
    "متوسط":"chip-mid", "متوسطة":"chip-mid",
    "ضعيف":"chip-bad", "ضعيفة":"chip-bad", "يعاد":"chip-bad", "يحتاج إعادة":"chip-bad", "يحتاج إلى إعادة":"chip-bad"
  };
  return `<span class="chip ${map[val]||'chip-mid'}">${val}</span>`;
}
function tabBtn(key){
  const meta = TRACK_META[key];
  const included = sessionDraft.tracks[key];
  return `<div class="tab-btn ${sessionTab===key?'active':''}" onclick="sessionTab='${key}'; render()">
    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-left:6px;background:${included?'var(--good)':'#c9c1af'}"></span>${meta.label}
  </div>`;
}
function setAttendance(v){ sessionDraft.attendance = v; render(); }

function trackToggleHeader(key, title){
  const included = sessionDraft.tracks[key];
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <h3 style="margin:0"><span class="dot"></span> ${title}</h3>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13.5px;font-weight:700;color:${included?'var(--good)':'var(--ink-soft)'}">
        <input type="checkbox" ${included?'checked':''} onchange="toggleTrack('${key}', this.checked)" style="width:17px;height:17px;">
        تضمين هذا المسار في الجلسة
      </label>
    </div>`;
}

function rangeFields(prefix, obj){
  return `
    <div class="grid g4">
      <div class="field"><label>من سورة</label><select onchange="updSurahRange('${prefix}','From', this.value)">${surahOptions(obj.surahFrom)}</select></div>
      <div class="field"><label>من آية</label><select onchange="upd('${prefix}.ayahFrom', this.value)">${ayahOptions(obj.surahFrom, obj.ayahFrom)}</select></div>
      <div class="field"><label>إلى سورة</label><select onchange="updSurahRange('${prefix}','To', this.value)">${surahOptions(obj.surahTo)}</select></div>
      <div class="field"><label>إلى آية</label><select onchange="upd('${prefix}.ayahTo', this.value)">${ayahOptions(obj.surahTo, obj.ayahTo)}</select></div>
    </div>`;
}
function evalGroup(prefix, options, current){
  const cls = {"جيد":"sel-good","جيدة":"sel-good","متوسط":"sel-mid","متوسطة":"sel-mid","ضعيف":"sel-bad","ضعيفة":"sel-bad","يعاد":"sel-bad","يحتاج إعادة":"sel-bad","يحتاج إلى إعادة":"sel-bad"};
  return `<div class="eval-group">${options.map(o=>`<div class="eval-opt ${current===o?cls[o]:''}" onclick="upd('${prefix}', '${o}')">${o}</div>`).join('')}</div>`;
}

function hifzForm(d){
  const on = d.tracks.hifz;
  return `
    ${trackToggleHeader('hifz','مقدار الحفظ (الاستظهار)')}
    <div class="${on?'':'track-off'}">
      <div class="subhead"><span class="dot"></span>الدرس المقرر (حفظ اليوم)</div>
      ${rangeFields('hifz', d.hifz)}
      <div class="subhead"><span class="dot"></span>تقييم الحفظ</div>
      ${evalGroup('hifz.evaluation', ["جيد","متوسط","ضعيف يعاد"], d.hifz.evaluation)}
      <hr class="sep">
      <div class="subhead"><span class="dot"></span>الدرس القادم (مقدار الحفظ للدرس المقبل)</div>
      ${rangeFields('hifz.next', d.hifz.next)}
    </div>
  `;
}
function murajaaForm(d){
  const on = d.tracks.murajaa;
  return `
    ${trackToggleHeader('murajaa','مسار المراجعة')}
    <div class="${on?'':'track-off'}">
      <div class="subhead"><span class="dot"></span>مراجعة القريب</div>
      ${rangeFields('murajaa.qareeb', d.murajaa.qareeb)}
      ${evalGroup('murajaa.qareeb.evaluation', ["جيد","متوسط","ضعيف يحتاج إعادة"], d.murajaa.qareeb.evaluation)}
      <hr class="sep">
      <div class="subhead"><span class="dot"></span>مراجعة البعيد</div>
      ${rangeFields('murajaa.baeed', d.murajaa.baeed)}
      ${evalGroup('murajaa.baeed.evaluation', ["جيد","متوسط","ضعيف يحتاج إعادة"], d.murajaa.baeed.evaluation)}
    </div>
  `;
}
function nazariyyahForm(d){
  const on = d.tracks.nazariyyah;
  return `
    ${trackToggleHeader('nazariyyah','التلاوة النظرية')}
    <div class="${on?'':'track-off'}">
      <div class="grid g2">
        <div class="field"><label>المتن</label>
          <select onchange="upd('talawahNazariyyah.matn', this.value)">
            ${['تحفة الأطفال','الجزرية (المقدمة الجزرية)'].map(m=>`<option ${d.talawahNazariyyah.matn===m?'selected':''}>${m}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid g2">
        <div class="field"><label>من بيت</label><input value="${d.talawahNazariyyah.baytFrom||''}" oninput="upd('talawahNazariyyah.baytFrom', this.value)"></div>
        <div class="field"><label>إلى بيت</label><input value="${d.talawahNazariyyah.baytTo||''}" oninput="upd('talawahNazariyyah.baytTo', this.value)"></div>
      </div>
      <div class="field"><label>عنوان مذكرة التجويد</label>
        <input value="${d.talawahNazariyyah.tajweedNoteTitle||''}" oninput="upd('talawahNazariyyah.tajweedNoteTitle', this.value)" placeholder="مثال: أحكام الميم الساكنة">
      </div>
    </div>
  `;
}
function talawahForm(d){
  const on = d.tracks.talawah;
  const det = d.talawah.details||{};
  return `
    ${trackToggleHeader('talawah','مقدار التلاوة')}
    <div class="${on?'':'track-off'}">
      ${rangeFields('talawah', d.talawah)}
      <div class="subhead"><span class="dot"></span>تقييم التلاوة</div>
      ${evalGroup('talawah.evaluation', ["جيدة","متوسطة","ضعيفة"], d.talawah.evaluation)}
      <hr class="sep">
      <div class="subhead"><span class="dot"></span>تفصيل الملاحظات</div>
      <div class="checks">
        ${TAJWEED_DETAILS.map(t=>`
          <label class="check-item">
            <input type="checkbox" ${det[t.key]?'checked':''} onchange="upd('talawah.details.${t.key}', this.checked)">
            ${t.label}
          </label>`).join('')}
      </div>
    </div>
  `;
}

function hadithOptions(selected){
  return HADITH40.map(h=>`<option value="${h.n}" ${Number(selected)===h.n?'selected':''}>الحديث ${h.n}</option>`).join('');
}
function arbaeenForm(d){
  const on = d.tracks.arbaeen;
  const current = hadithByNumber(d.arbaeen.number);
  const next = hadithByNumber(d.arbaeen.next?.number);
  return `
    ${trackToggleHeader('arbaeen','مسار حفظ الأربعين النووية')}
    <div class="${on?'':'track-off'}">
      <div class="subhead"><span class="dot"></span>حديث اليوم</div>
      <div class="grid g3">
        <div class="field"><label>رقم الحديث</label>
          <select onchange="upd('arbaeen.number', this.value)">${hadithOptions(d.arbaeen.number)}</select>
        </div>
      </div>
      <div class="hadith-box" style="background:var(--bg-soft,#faf8f2);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:10px 0">
        <div class="small-note" style="font-weight:700;margin-bottom:6px">${current.narrator}</div>
        <div style="line-height:1.9">${current.text}</div>
        <div class="small-note" style="margin-top:6px">${current.takhrij}</div>
      </div>
      <div class="subhead"><span class="dot"></span>تقييم الحفظ</div>
      ${evalGroup('arbaeen.evaluation', ["جيد","متوسط","يحتاج إلى إعادة"], d.arbaeen.evaluation)}
      <hr class="sep">
      <div class="subhead"><span class="dot"></span>حديث الدرس القادم</div>
      <div class="grid g3">
        <div class="field"><label>رقم الحديث القادم</label>
          <select onchange="upd('arbaeen.next.number', this.value)">${hadithOptions(d.arbaeen.next?.number)}</select>
        </div>
      </div>
      <div class="hadith-box" style="background:var(--bg-soft,#faf8f2);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-top:10px">
        <div class="small-note" style="font-weight:700;margin-bottom:6px">${next.narrator}</div>
        <div style="line-height:1.9">${next.text}</div>
        <div class="small-note" style="margin-top:6px">${next.takhrij}</div>
      </div>
    </div>
  `;
}

function adhkarOptions(selected){
  return ADHKAR.map(a=>`<option value="${a.bab.replace(/"/g,'&quot;')}" ${selected===a.bab?'selected':''}>${a.bab}</option>`).join('');
}
function adhkarForm(d){
  const on = d.tracks.adhkar;
  const current = adhkarByBab(d.adhkar.bab);
  const next = adhkarByBab(d.adhkar.next?.bab);
  return `
    ${trackToggleHeader('adhkar','مسار حفظ الأذكار')}
    <div class="${on?'':'track-off'}">
      <div class="subhead"><span class="dot"></span>باب اليوم</div>
      <div class="grid g3">
        <div class="field"><label>الباب</label>
          <select onchange="upd('adhkar.bab', this.value)">${adhkarOptions(d.adhkar.bab)}</select>
        </div>
      </div>
      <div class="hadith-box" style="background:var(--bg-soft,#faf8f2);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:10px 0">
        <div class="small-note" style="font-weight:700;margin-bottom:6px">الذكر</div>
        <div style="line-height:1.9">${current.dhikr}</div>
        <div class="small-note" style="font-weight:700;margin-top:10px">الدليل</div>
        <div class="small-note" style="line-height:1.8">${current.daleel}</div>
      </div>
      <div class="subhead"><span class="dot"></span>تقييم الحفظ</div>
      ${evalGroup('adhkar.evaluation', ["جيد","متوسط","يحتاج إلى إعادة"], d.adhkar.evaluation)}
      <hr class="sep">
      <div class="subhead"><span class="dot"></span>باب الدرس القادم</div>
      <div class="grid g3">
        <div class="field"><label>الباب القادم</label>
          <select onchange="upd('adhkar.next.bab', this.value)">${adhkarOptions(d.adhkar.next?.bab)}</select>
        </div>
      </div>
      <div class="hadith-box" style="background:var(--bg-soft,#faf8f2);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-top:10px">
        <div class="small-note" style="font-weight:700;margin-bottom:6px">الذكر</div>
        <div style="line-height:1.9">${next.dhikr}</div>
        <div class="small-note" style="font-weight:700;margin-top:10px">الدليل</div>
        <div class="small-note" style="line-height:1.8">${next.daleel}</div>
      </div>
    </div>
  `;
}

// ===================== حالة عامة =====================
const TRACK_META = {
  hifz:      {label:"مسار الحفظ",       field:"hifz"},
  murajaa:   {label:"مسار المراجعة",    field:"murajaa"},
  nazariyyah:{label:"التلاوة النظرية",  field:"talawahNazariyyah"},
  talawah:   {label:"مسار التلاوة",     field:"talawah"},
  arbaeen:   {label:"الأربعون النووية", field:"arbaeen"},
  adhkar:    {label:"مسار الأذكار",     field:"adhkar"},
};

let currentUser = null;      // {uid, email, profile:{role, name, assignedGroupIds?, linkedStudentIds?}}
let currentView = "dashboard";
let activeStudentId = null;   // المتعلّم المعروض حاليًا (لوحة المتابعة / السجل / التقارير)
let parentChildId = null;     // الابن المعروض حاليًا في بوابة الأولياء
let authMode = "login";       // login | signup-role | signup-admin | signup-parent | parent-link | forgot
let signupRole = null;        // admin | parent
let authError = "";
let authBusy = false;

// حالة صفحات الإدارة
let editingStudentId = null;
let groupFilter = "";
let editingGroupId = null;
let editingYearId = null;
let editingTeacherId = null;
let teacherGroupPicks = [];
let editingExamId = null;
let examStudentFilter = "";
let examTermFilter = "";
let classSheetGroupId = "";
let classSheetTerm = "الفصل الأول";
let paymentStudentFilter = "";
let paymentStatusFilter = "";

let sessionDraft = null;
let sessionTab = "hifz";

function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36); }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function toast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove("show"), 2600);
}
function activeYear(){
  return Store.DB.years.find(y=>y.active) || Store.DB.years[0] || null;
}
function yearLabel(id){
  const y = Store.DB.years.find(y=>y.id===id);
  return y? y.name : "—";
}
function groupName(id){
  if(!id) return "بدون فوج";
  const g = Store.DB.groups.find(g=>g.id===id);
  return g? g.name : "بدون فوج";
}
function studentById(id){ return Store.DB.students.find(s=>s.id===id) || null; }
function studentSessions(studentId){
  return Store.DB.sessions.filter(s=>s.studentId===studentId).sort((a,b)=> (b.date||"").localeCompare(a.date||""));
}
function studentExams(studentId){
  return Store.DB.exams.filter(e=>e.studentId===studentId).sort((a,b)=> (b.date||"").localeCompare(a.date||""));
}
function studentPayments(studentId){
  return Store.DB.payments.filter(p=>p.studentId===studentId).sort((a,b)=> (b.period||"").localeCompare(a.period||""));
}
function roleOf(){ return currentUser?.profile?.role || null; }
function isAdmin(){ return roleOf()==="admin"; }
function isTeacher(){ return roleOf()==="teacher"; }
function isParent(){ return roleOf()==="parent"; }
// قائمة المتعلمين المرئية لنطاق المستخدم الحالي ضمن السنة النشطة (للمعلم/المدير)
function scopedStudents(){
  const y = activeYear();
  let list = Store.DB.students;
  if(y) list = list.filter(s=> s.yearId===y.id || !s.yearId);
  return list;
}

// ===================== واجهات المصادقة =====================
function renderAuthScreen(){
  const root = document.getElementById("authRoot");
  if(!root) return;
  document.getElementById("authScreen").style.display = "flex";
  document.getElementById("mainShell").style.display = "none";

  if(authMode === "parent-link"){ root.innerHTML = parentLinkTpl(); return; }
  if(authMode === "forgot"){ root.innerHTML = forgotTpl(); return; }
  if(authMode === "signup-role"){ root.innerHTML = roleTpl(); return; }
  if(authMode === "signup-admin"){ root.innerHTML = signupAdminTpl(); return; }
  if(authMode === "signup-parent"){ root.innerHTML = signupParentTpl(); return; }
  root.innerHTML = loginTpl();
}

function errBox(){ return authError? `<div class="auth-error">${authError}</div>` : ""; }

function loginTpl(){
  return `
    <div class="auth-tabs">
      <div class="auth-tab active">تسجيل الدخول</div>
      <div class="auth-tab" onclick="setAuthMode('signup-role')">إنشاء حساب جديد</div>
    </div>
    ${errBox()}
    <div class="auth-field"><label>البريد الإلكتروني</label><input id="log-email" type="email" placeholder="example@email.com"></div>
    <div class="auth-field"><label>كلمة المرور</label><input id="log-pass" type="password"></div>
    <button class="btn btn-primary" style="width:100%" onclick="onLoginSubmit()" ${authBusy?'disabled':''}>${authBusy?'...جارٍ الدخول':'دخول'}</button>
    <div class="auth-hint"><span class="auth-link" onclick="setAuthMode('forgot')">نسيت كلمة المرور؟</span></div>
  `;
}

function forgotTpl(){
  return `
    <h3 style="margin-top:0">استعادة كلمة المرور</h3>
    ${errBox()}
    <div class="auth-field"><label>البريد الإلكتروني</label><input id="fg-email" type="email"></div>
    <button class="btn btn-primary" style="width:100%" onclick="onForgotSubmit()">إرسال رابط الاستعادة</button>
    <div class="auth-hint"><span class="auth-link" onclick="setAuthMode('login')">الرجوع لتسجيل الدخول</span></div>
  `;
}

function roleTpl(){
  return `
    <h3 style="margin-top:0">إنشاء حساب جديد</h3>
    <p class="small-note">اختر نوع الحساب المناسب لك:</p>
    <div class="role-pick">
      <div class="rp ${signupRole==='parent'?'active':''}" onclick="signupRole='parent'; render()">
        👪<br>ولي أمر<br><span class="small-note">لمتابعة تقدم ابني/ابنتي</span>
      </div>
      <div class="rp ${signupRole==='admin'?'active':''}" onclick="signupRole='admin'; render()">
        🗝️<br>مدير إداري (مسيّر المدرسة)<br><span class="small-note">يحتاج رمز دعوة</span>
      </div>
    </div>
    <button class="btn btn-primary" style="width:100%" ${!signupRole?'disabled':''} onclick="setAuthMode(signupRole==='admin'?'signup-admin':'signup-parent')">متابعة</button>
    <div class="auth-hint">حسابات المعلّمين تُنشأ من طرف المدير الإداري للمدرسة فقط، وليس عبر هذا النموذج.</div>
    <div class="auth-hint"><span class="auth-link" onclick="setAuthMode('login')">لدي حساب بالفعل — تسجيل الدخول</span></div>
  `;
}

function signupAdminTpl(){
  return `
    <h3 style="margin-top:0">إنشاء حساب مدير إداري</h3>
    ${errBox()}
    <div class="auth-field"><label>الاسم الكامل</label><input id="su-name"></div>
    <div class="auth-field"><label>البريد الإلكتروني</label><input id="su-email" type="email"></div>
    <div class="auth-field"><label>كلمة المرور</label><input id="su-pass" type="password"></div>
    <div class="auth-field"><label>رمز دعوة المدير الإداري</label><input id="su-code" placeholder="يُطلب من إدارة المدرسة"></div>
    <button class="btn btn-primary" style="width:100%" onclick="onSignupAdminSubmit()" ${authBusy?'disabled':''}>${authBusy?'...جارٍ الإنشاء':'إنشاء الحساب'}</button>
    <div class="auth-hint"><span class="auth-link" onclick="setAuthMode('signup-role')">رجوع</span></div>
  `;
}

function signupParentTpl(){
  return `
    <h3 style="margin-top:0">إنشاء حساب ولي أمر</h3>
    ${errBox()}
    <div class="auth-field"><label>الاسم الكامل</label><input id="su-name"></div>
    <div class="auth-field"><label>البريد الإلكتروني</label><input id="su-email" type="email"></div>
    <div class="auth-field"><label>كلمة المرور</label><input id="su-pass" type="password"></div>
    <button class="btn btn-primary" style="width:100%" onclick="onSignupParentSubmit()" ${authBusy?'disabled':''}>${authBusy?'...جارٍ الإنشاء':'إنشاء الحساب'}</button>
    <div class="auth-hint"><span class="auth-link" onclick="setAuthMode('signup-role')">رجوع</span></div>
  `;
}

function parentLinkTpl(){
  return `
    <h3 style="margin-top:0">ربط حسابك بابنك/ابنتك</h3>
    <p class="small-note">أدخل الرقم التعريفي للمتعلم (تحصلون عليه من إدارة المدرسة) وتاريخ ميلاده للتحقق.</p>
    ${errBox()}
    <div class="auth-field"><label>الرقم التعريفي للمتعلم</label><input id="lk-code" placeholder="مثال: NHD-482913"></div>
    <div class="auth-field"><label>تاريخ ميلاد المتعلم</label><input id="lk-bdate" type="date"></div>
    <button class="btn btn-primary" style="width:100%" onclick="onLinkChildSubmit()" ${authBusy?'disabled':''}>${authBusy?'...جارٍ الربط':'ربط الحساب'}</button>
    <div class="auth-hint">يمكنكم ربط أكثر من ابن لاحقًا من داخل حسابكم.</div>
    <div class="auth-hint"><span class="auth-link" onclick="AuthApi.logout()">تسجيل الخروج</span></div>
  `;
}

function setAuthMode(mode){ authMode = mode; authError = ""; render(); }

async function onLoginSubmit(){
  const email = document.getElementById("log-email").value.trim();
  const pass = document.getElementById("log-pass").value;
  if(!email || !pass){ authError="أدخل البريد وكلمة المرور."; render(); return; }
  authBusy = true; authError=""; render();
  try{ await AuthApi.login(email, pass); }
  catch(e){ authError = friendlyAuthError(e); }
  authBusy = false; render();
}

async function onSignupAdminSubmit(){
  const name = document.getElementById("su-name").value.trim();
  const email = document.getElementById("su-email").value.trim();
  const pass = document.getElementById("su-pass").value;
  const code = document.getElementById("su-code").value;
  if(!name || !email || !pass){ authError="الرجاء تعبئة جميع الحقول."; render(); return; }
  authBusy = true; authError=""; render();
  try{ await AuthApi.signUpAdmin(name, email, pass, code); }
  catch(e){ authError = friendlyAuthError(e); }
  authBusy = false; render();
}

async function onSignupParentSubmit(){
  const name = document.getElementById("su-name").value.trim();
  const email = document.getElementById("su-email").value.trim();
  const pass = document.getElementById("su-pass").value;
  if(!name || !email || !pass){ authError="الرجاء تعبئة جميع الحقول."; render(); return; }
  authBusy = true; authError=""; render();
  try{ await AuthApi.signUpParent(name, email, pass); }
  catch(e){ authError = friendlyAuthError(e); }
  authBusy = false; render();
}

async function onForgotSubmit(){
  const email = document.getElementById("fg-email").value.trim();
  if(!email){ authError="أدخل بريدك الإلكتروني."; render(); return; }
  try{ await AuthApi.resetPassword(email); toast("تم إرسال رابط استعادة كلمة المرور إلى بريدك"); setAuthMode("login"); }
  catch(e){ authError = friendlyAuthError(e); render(); }
}

async function onLinkChildSubmit(){
  const code = document.getElementById("lk-code").value.trim();
  const bdate = document.getElementById("lk-bdate").value;
  if(!code || !bdate){ authError="أدخل الرقم التعريفي وتاريخ الميلاد."; render(); return; }
  authBusy = true; authError=""; render();
  try{
    await AuthApi.linkParentToStudent(currentUser.uid, code, bdate);
    toast("تم ربط الحساب بنجاح");
    currentUser.profile = await AuthApi.getUserProfile(currentUser.uid);
    authMode = "login";
    Store.startListeners(currentUser, ()=>render());
  } catch(e){ authError = friendlyAuthError(e); }
  authBusy = false; render();
}

function friendlyAuthError(e){
  const m = (e && e.message) || String(e);
  if(m.includes("auth/invalid-credential") || m.includes("auth/wrong-password") || m.includes("auth/user-not-found")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if(m.includes("auth/email-already-in-use")) return "هذا البريد الإلكتروني مستخدم بالفعل.";
  if(m.includes("auth/weak-password")) return "كلمة المرور ضعيفة، استخدم 6 أحرف على الأقل.";
  if(m.includes("auth/invalid-email")) return "صيغة البريد الإلكتروني غير صحيحة.";
  return m.replace(/^Error:\s*/,'');
}

// ===================== الإقلاع =====================
async function initApp(){
  AuthApi = await import("./auth.js");
  Store = await import("./store.js");

  AuthApi.watchAuth(async (user)=>{
    if(!user){
      currentUser = null;
      Store.stopListeners();
      authMode = "login";
      render();
      return;
    }
    currentUser = user;
    if(!user.profile){
      authError = "تعذّر تحميل بيانات حسابك. إذا أنشأتم الحساب للتو، انتظروا لحظة ثم أعيدوا المحاولة. إن تكرر الأمر تواصلوا مع إدارة المدرسة.";
      authMode = "login";
      await AuthApi.logout();
      return;
    }
    if(user.profile.role === "parent" && (!user.profile.linkedStudentIds || !user.profile.linkedStudentIds.length)){
      authMode = "parent-link";
      render();
      return;
    }
    Store.startListeners(user, ()=> render());
    render();
  });

  document.getElementById("logoutBtn")?.addEventListener("click", ()=> AuthApi.logout());
}
initApp();

// ===================== موزّع العرض الرئيسي =====================
function render(){
  if(!currentUser){ renderAuthScreen(); return; }
  if(authMode === "parent-link"){ renderAuthScreen(); return; }

  document.getElementById("authScreen").style.display = "none";
  document.getElementById("mainShell").style.display = "grid";

  buildNav();
  renderUserBadge();
  renderTopbar();

  const root = document.getElementById("view-root");
  if(isParent()) return renderParentPortal(root);
  return renderStaffApp(root);
}

function renderUserBadge(){
  const el = document.getElementById("userBadge");
  if(!el) return;
  const p = currentUser.profile;
  const roleLabel = {admin:"مدير إداري", teacher:"معلّم / مشرف حلقة", parent:"ولي أمر"}[p.role] || p.role;
  el.innerHTML = `<div class="u-name">${p.name||currentUser.email}</div><div class="u-role">${roleLabel}</div>`;
}

const NAV_STAFF = [
  {view:"dashboard", label:"لوحة المتابعة", roles:["admin","teacher"]},
  {view:"students", label:"المتعلّمون", roles:["admin","teacher"]},
  {view:"groups", label:"الأفواج", roles:["admin"]},
  {view:"years", label:"السنوات الدراسية", roles:["admin"]},
  {view:"teachers", label:"حسابات المعلّمين", roles:["admin"]},
  {view:"session", label:"تسجيل جلسة", roles:["admin","teacher"]},
  {view:"history", label:"السجلّ", roles:["admin","teacher"]},
  {view:"exams", label:"الاختبارات والفروض", roles:["admin","teacher"]},
  {view:"classSheet", label:"كشف النتائج الفصلي", roles:["admin","teacher"]},
  {view:"payments", label:"الاشتراكات", roles:["admin"]},
  {view:"reports", label:"التقارير", roles:["admin","teacher"]},
  {view:"stats", label:"الإحصائيات", roles:["admin","teacher"]},
];

function buildNav(){
  const el = document.getElementById("navItems");
  if(!el) return;
  const role = roleOf();
  const items = NAV_STAFF.filter(n=>n.roles.includes(role));
  el.innerHTML = items.map(n=>`<button class="nav-btn ${currentView===n.view?'active':''}" onclick="switchView('${n.view}')"><span class="n">◆</span> ${n.label}</button>`).join('');
}

function renderTopbar(){
  const sub = document.getElementById("roleSubtitle");
  const y = activeYear();
  if(sub) sub.textContent = y? `منصة إدارة حلقة التحفيظ — السنة الدراسية: ${y.name}` : "منصة إدارة حلقة التحفيظ";
  const picker = document.getElementById("topbarActions");
  if(!picker) return;
  const showPicker = ["dashboard","session","history","reports","stats"].includes(currentView);
  const select = document.getElementById("student-select");
  const avatar = document.getElementById("avatar-letter");
  if(!showPicker || isParent()){
    select.style.display = "none"; avatar.style.display="none"; return;
  }
  select.style.display=""; avatar.style.display="";
  const list = scopedStudents();
  select.innerHTML = list.map(s=>`<option value="${s.id}" ${activeStudentId===s.id?'selected':''}>${s.name}</option>`).join('') || `<option value="">لا يوجد متعلمون</option>`;
  if(!activeStudentId && list.length) activeStudentId = list[0].id;
  const st = studentById(activeStudentId);
  avatar.textContent = st? st.name.trim()[0] : "؟";
  select.onchange = ()=>{ activeStudentId = select.value; render(); };
}

function switchView(v){ currentView = v; render(); }

// ===================== واجهة الطاقم (مدير/معلّم) =====================
function renderStaffApp(root){
  const adminOnly = ["groups","years","teachers","payments"];
  if(adminOnly.includes(currentView) && !isAdmin()){
    root.innerHTML = `<div class="card"><div class="empty"><div class="big">🔒</div>هذه الصفحة مخصّصة للمدير الإداري فقط.</div></div>`;
    return;
  }
  if(!Store.DB.years.length && currentView!=="years" && !isAdmin()){
    root.innerHTML = `<div class="card"><div class="empty"><div class="big">📅</div>لم يتم إنشاء أي سنة دراسية بعد. يرجى التواصل مع المدير الإداري.</div></div>`;
    return;
  }
  if(!Store.DB.years.length && currentView!=="years" && isAdmin()){
    root.innerHTML = `<div class="card"><div class="empty"><div class="big">📅</div>ابدأ بإنشاء سنة دراسية أولًا من صفحة "السنوات الدراسية".</div>
      <div style="text-align:center;margin-top:10px"><button class="btn btn-primary" onclick="switchView('years')">الذهاب إلى السنوات الدراسية</button></div></div>`;
    return;
  }

  if(currentView==="dashboard") return renderDashboard(root);
  if(currentView==="students") return renderStudents(root);
  if(currentView==="groups") return renderGroups(root);
  if(currentView==="years") return renderYears(root);
  if(currentView==="teachers") return renderTeachers(root);
  if(currentView==="session") return renderSessionView(root);
  if(currentView==="history") return renderHistory(root);
  if(currentView==="exams") return renderExams(root);
  if(currentView==="classSheet") return renderClassSheet(root);
  if(currentView==="payments") return renderPayments(root);
  if(currentView==="reports") return renderReports(root);
  if(currentView==="stats") return renderStats(root);
  root.innerHTML = `<div class="card">صفحة غير معروفة</div>`;
}

// المتعلمون المرئيون لهذا المستخدم ضمن نطاقه (فوج المعلّم أو الكل للمدير) والسنة النشطة
function scopeStudentsForView(){
  return scopedStudents();
}

// ===================== إحصائيات =====================
function computeStats(studentId, range){
  const sess = studentSessions(studentId);
  const now = new Date();
  let from = new Date(0);
  if(range==="week"){ from = new Date(now); from.setDate(now.getDate()-7); }
  if(range==="month"){ from = new Date(now); from.setMonth(now.getMonth()-1); }
  if(range==="day"){ from = new Date(now); from.setHours(0,0,0,0); }
  const filtered = sess.filter(s=> new Date(s.date) >= from);

  const evalCount = {hifz:{}, murajaa:{}, talawah:{}, arbaeen:{}, adhkar:{}};
  let present=0, absent=0, late=0;
  filtered.forEach(s=>{
    if(s.attendance==="حاضر") present++;
    else if(s.attendance==="غائب") absent++;
    else if(s.attendance==="متأخر") late++;
    if(s.hifz?.evaluation) evalCount.hifz[s.hifz.evaluation] = (evalCount.hifz[s.hifz.evaluation]||0)+1;
    if(s.murajaa?.qareeb?.evaluation) evalCount.murajaa[s.murajaa.qareeb.evaluation] = (evalCount.murajaa[s.murajaa.qareeb.evaluation]||0)+1;
    if(s.murajaa?.baeed?.evaluation) evalCount.murajaa[s.murajaa.baeed.evaluation] = (evalCount.murajaa[s.murajaa.baeed.evaluation]||0)+1;
    if(s.talawah?.evaluation) evalCount.talawah[s.talawah.evaluation] = (evalCount.talawah[s.talawah.evaluation]||0)+1;
    if(s.arbaeen?.evaluation) evalCount.arbaeen[s.arbaeen.evaluation] = (evalCount.arbaeen[s.arbaeen.evaluation]||0)+1;
    if(s.adhkar?.evaluation) evalCount.adhkar[s.adhkar.evaluation] = (evalCount.adhkar[s.adhkar.evaluation]||0)+1;
  });
  return {count:filtered.length, present, absent, late, evalCount, sessions:filtered};
}

// ===================== لوحة المتابعة =====================
function renderDashboard(root){
  const list = scopeStudentsForView();
  if(!list.length){
    root.innerHTML = `<div class="card"><div class="empty"><div class="big">👤</div>لا يوجد متعلمون ${isTeacher()?'في أفواجك':''} بعد.</div></div>`;
    return;
  }
  const student = studentById(activeStudentId) || list[0];
  const sess = studentSessions(student.id);
  const last = sess[0];
  const st7 = computeStats(student.id, "week");
  root.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <h3 style="margin:0"><span class="dot"></span> بطاقة المتعلم</h3>
        ${isAdmin()? `<button class="btn btn-sm btn-gold no-print" onclick="editingStudentId='${student.id}'; switchView('students')">✎ تعديل البيانات</button>`:''}
      </div>
      <div class="grid g3">
        <div><label>الاسم</label><div>${student.name}</div></div>
        <div><label>الرقم التعريفي</label><div style="font-family:monospace">${student.code||'—'}</div></div>
        <div><label>السن</label><div>${student.age||'—'}</div></div>
        <div><label>المستوى الدراسي</label><div>${student.level||'—'}</div></div>
        <div><label>الفوج</label><div>${groupName(student.groupId)}</div></div>
        <div><label>السنة الدراسية</label><div>${yearLabel(student.yearId)}</div></div>
        <div><label>تاريخ الميلاد</label><div>${student.birthDate||'—'}</div></div>
        <div><label>مكان الميلاد</label><div>${student.birthPlace||'—'}</div></div>
        <div><label>تاريخ الالتحاق</label><div>${(student.createdAt||'').slice(0,10)}</div></div>
      </div>
    </div>

    <div class="grid g4">
      <div class="card stat-card"><div class="stat-num">${sess.length}</div><div class="stat-lbl">مجموع الجلسات</div></div>
      <div class="card stat-card"><div class="stat-num">${st7.present}</div><div class="stat-lbl">حضور آخر ٧ أيام</div></div>
      <div class="card stat-card"><div class="stat-num">${st7.absent}</div><div class="stat-lbl">غياب آخر ٧ أيام</div></div>
      <div class="card stat-card"><div class="stat-num">${last? last.date : '—'}</div><div class="stat-lbl">آخر جلسة</div></div>
    </div>

    <div class="card">
      <h3><span class="dot"></span> آخر جلسة مسجّلة</h3>
      ${ last ? renderSessionSummary(last) : `<div class="empty">لا توجد جلسات مسجّلة بعد.</div>` }
    </div>

    <button class="btn btn-primary" onclick="startNewSession()">+ تسجيل جلسة اليوم</button>
  `;
}

function trackBadges(s){
  const items = [];
  if(s.hifz) items.push(['الحفظ','var(--good)']);
  if(s.murajaa && (s.murajaa.qareeb?.surahFrom || s.murajaa.baeed?.surahFrom || s.murajaa.qareeb?.evaluation || s.murajaa.baeed?.evaluation)) items.push(['المراجعة','var(--gold)']);
  if(s.talawahNazariyyah) items.push(['التلاوة النظرية','var(--palm)']);
  if(s.talawah) items.push(['التلاوة','var(--bad)']);
  if(s.arbaeen) items.push(['الأربعون النووية','#8a5a44']);
  if(s.adhkar) items.push(['الأذكار','#5a7a8a']);
  if(!items.length) return '';
  return `<div style="margin-bottom:10px">${items.map(([l,c])=>`<span class="chip" style="background:${c}22;color:${c};margin-left:6px">${l}</span>`).join('')}</div>`;
}

function renderSessionSummary(s){
  return `
    ${trackBadges(s)}
    <div class="grid g2">
      <div><span class="subhead"><span class="dot"></span>الحفظ</span>
        ${s.hifz?.surahFrom? `<p>${surahRangeLabel(s.hifz)} ${evalChip(s.hifz.evaluation)}</p><p class="small-note">الدرس القادم: ${s.hifz.next?.surahFrom? surahRangeLabel(s.hifz.next) : '—'}</p>` : '<p class="small-note">لم يسجَّل</p>'}
      </div>
      <div><span class="subhead"><span class="dot"></span>المراجعة</span>
        ${s.murajaa?.qareeb?.surahFrom? `<p>قريب: ${surahRangeLabel(s.murajaa.qareeb)} ${evalChip(s.murajaa.qareeb.evaluation)}</p>`:''}
        ${s.murajaa?.baeed?.surahFrom? `<p>بعيد: ${surahRangeLabel(s.murajaa.baeed)} ${evalChip(s.murajaa.baeed.evaluation)}</p>`:''}
        ${(!s.murajaa?.qareeb?.surahFrom && !s.murajaa?.baeed?.surahFrom) ? '<p class="small-note">لم يسجَّل</p>':''}
      </div>
      <div><span class="subhead"><span class="dot"></span>التلاوة النظرية</span>
        ${s.talawahNazariyyah?.matn ? `<p>${s.talawahNazariyyah.matn} — الأبيات ${s.talawahNazariyyah.baytFrom||'?'} إلى ${s.talawahNazariyyah.baytTo||'?'}</p><p class="small-note">${s.talawahNazariyyah.tajweedNoteTitle||''}</p>` : '<p class="small-note">لم يسجَّل</p>'}
      </div>
      <div><span class="subhead"><span class="dot"></span>التلاوة</span>
        ${s.talawah?.surahFrom? `<p>${surahRangeLabel(s.talawah)} ${evalChip(s.talawah.evaluation)}</p>`:'<p class="small-note">لم يسجَّل</p>'}
      </div>
      <div><span class="subhead"><span class="dot"></span>الأربعون النووية</span>
        ${s.arbaeen?.number? `<p>الحديث ${s.arbaeen.number} ${evalChip(s.arbaeen.evaluation)}</p><p class="small-note">القادم: ${s.arbaeen.next?.number? 'الحديث '+s.arbaeen.next.number : '—'}</p>` : '<p class="small-note">لم يسجَّل</p>'}
      </div>
      <div><span class="subhead"><span class="dot"></span>الأذكار</span>
        ${s.adhkar?.bab? `<p>${s.adhkar.bab} ${evalChip(s.adhkar.evaluation)}</p><p class="small-note">القادم: ${s.adhkar.next?.bab||'—'}</p>` : '<p class="small-note">لم يسجَّل</p>'}
      </div>
    </div>
    <div class="small-note">الحضور: ${s.attendance||'—'} · التاريخ: ${s.date}</div>
  `;
}

// ===================== المتعلّمون =====================
function renderStudents(root){
  if(!isAdmin()){
    // المعلّم: عرض للقراءة فقط لمتعلمي أفواجه
    const list = scopeStudentsForView();
    root.innerHTML = `
      <div class="card">
        <h3><span class="dot"></span> متعلّمو أفواجك (${list.length})</h3>
        ${list.length? `<table><thead><tr><th>الرقم التعريفي</th><th>الاسم</th><th>السن</th><th>الفوج</th><th>الجلسات</th><th></th></tr></thead>
        <tbody>${list.map(s=>`
          <tr>
            <td style="font-family:monospace">${s.code}</td><td>${s.name}</td><td>${s.age||'—'}</td>
            <td>${groupName(s.groupId)}</td><td>${studentSessions(s.id).length}</td>
            <td><button class="btn btn-sm btn-line" onclick="activeStudentId='${s.id}'; switchView('dashboard')">فتح</button></td>
          </tr>`).join('')}</tbody></table>` : `<div class="empty">لا يوجد متعلمون في أفواجك بعد.</div>`}
        <p class="locked-note" style="margin-top:14px">تسجيل المتعلمين الجدد وتفويجهم من صلاحيات المدير الإداري فقط.</p>
      </div>
    `;
    return;
  }

  const editing = editingStudentId ? Store.DB.students.find(s=>s.id===editingStudentId) : null;
  const y = activeYear();
  root.innerHTML = `
    <div class="card">
      <h3><span class="dot"></span> ${editing? 'تعديل بيانات المتعلم: '+editing.name : 'تسجيل متعلم جديد'}</h3>
      <div class="grid g3">
        <div class="field"><label>الاسم الكامل</label><input id="ns-name" placeholder="مثال: عبد الله محمد" value="${editing?.name||''}"></div>
        <div class="field"><label>السن</label><input id="ns-age" type="number" value="${editing?.age||''}"></div>
        <div class="field"><label>المستوى الدراسي</label><input id="ns-level" value="${editing?.level||''}"></div>
        <div class="field"><label>تاريخ الميلاد</label><input id="ns-bdate" type="date" value="${editing?.birthDate||''}"></div>
        <div class="field"><label>مكان الميلاد</label><input id="ns-bplace" value="${editing?.birthPlace||''}"></div>
        <div class="field"><label>الفوج</label>
          <select id="ns-group">
            <option value="">بدون فوج</option>
            ${Store.DB.groups.map(g=>`<option value="${g.id}" ${editing?.groupId===g.id?'selected':''}>${g.name}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>السنة الدراسية</label>
          <select id="ns-year">
            ${Store.DB.years.map(yy=>`<option value="${yy.id}" ${(editing?.yearId||y?.id)===yy.id?'selected':''}>${yy.name}</option>`).join('')}
          </select>
        </div>
        ${editing? `<div class="field"><label>الرقم التعريفي</label><input value="${editing.code}" disabled style="font-family:monospace;background:#f4f0e6"></div>` : ''}
      </div>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn btn-primary" onclick="onSaveStudent()">${editing? '💾 حفظ التعديلات' : 'تسجيل المتعلم'}</button>
        ${editing? `<button class="btn btn-line" onclick="editingStudentId=null; render()">إلغاء التعديل</button>` : ''}
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px">
        <h3 style="margin:0"><span class="dot"></span> قائمة المتعلمين (${Store.DB.students.length})</h3>
        <div style="display:flex;gap:8px;align-items:center" class="no-print">
          <label class="small-note">تصفية حسب الفوج:</label>
          <select onchange="groupFilter=this.value; render()">
            <option value="">الكل</option>
            ${Store.DB.groups.map(g=>`<option value="${g.id}" ${groupFilter===g.id?'selected':''}>${g.name}</option>`).join('')}
          </select>
        </div>
      </div>
      ${(()=>{ const list = groupFilter? Store.DB.students.filter(s=>s.groupId===groupFilter) : Store.DB.students;
        return list.length? `<table><thead><tr><th>الرقم التعريفي</th><th>الاسم</th><th>السن</th><th>المستوى</th><th>الفوج</th><th>السنة</th><th>الجلسات</th><th></th></tr></thead>
      <tbody>${list.map(s=>`
        <tr>
          <td style="font-family:monospace">${s.code}</td>
          <td>${s.name}</td><td>${s.age||'—'}</td><td>${s.level||'—'}</td>
          <td>${groupName(s.groupId)}</td><td>${yearLabel(s.yearId)}</td>
          <td>${studentSessions(s.id).length}</td>
          <td style="display:flex;gap:6px">
            <button class="btn btn-sm btn-line" onclick="activeStudentId='${s.id}'; switchView('dashboard')">فتح</button>
            <button class="btn btn-sm btn-gold" onclick="editingStudentId='${s.id}'; render(); window.scrollTo(0,0)">تعديل</button>
            <button class="btn btn-sm btn-danger" onclick="onDeleteStudent('${s.id}')">حذف</button>
          </td>
        </tr>`).join('')}</tbody></table>` : `<div class="empty">لا يوجد متعلمون في هذه التصفية.</div>`; })()}
    </div>
  `;
}

async function onSaveStudent(){
  const name = document.getElementById("ns-name").value.trim();
  if(!name) return toast("أدخل اسم المتعلم أولاً");
  const age = document.getElementById("ns-age").value;
  const level = document.getElementById("ns-level").value.trim();
  const birthDate = document.getElementById("ns-bdate").value;
  const birthPlace = document.getElementById("ns-bplace").value.trim();
  const groupId = document.getElementById("ns-group").value || null;
  const yearId = document.getElementById("ns-year").value || null;
  try{
    if(editingStudentId){
      await Store.updateStudent(editingStudentId, {name, age, level, birthDate, birthPlace, groupId, yearId});
      toast("تم حفظ تعديلات المتعلم");
      editingStudentId = null;
      render();
    }else{
      await Store.addStudent({name, age, level, birthDate, birthPlace, groupId, yearId});
      toast("تم تسجيل المتعلم بنجاح");
      render();
    }
  }catch(e){ toast("تعذّر الحفظ: "+(e.message||e)); }
}

async function onDeleteStudent(id){
  if(!confirm("هل تريدون حذف هذا المتعلم؟ سيتم حذف بياناته فقط، أما جلساته السابقة فتبقى في السجل.")) return;
  try{ await Store.deleteStudent(id); toast("تم حذف المتعلم"); if(activeStudentId===id) activeStudentId=null; render(); }
  catch(e){ toast("تعذّر الحذف: "+(e.message||e)); }
}

// ===================== الأفواج =====================
function renderGroups(root){
  const editing = editingGroupId ? Store.DB.groups.find(g=>g.id===editingGroupId) : null;
  root.innerHTML = `
    <div class="card">
      <h3><span class="dot"></span> ${editing? 'تعديل الفوج: '+editing.name : 'إضافة فوج جديد'}</h3>
      <div class="grid g3">
        <div class="field"><label>اسم الفوج</label><input id="ng-name" placeholder="مثال: الفوج الأول" value="${editing?.name||''}"></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn btn-primary" onclick="onSaveGroup()">${editing? '💾 حفظ التعديلات' : 'إضافة الفوج'}</button>
        ${editing? `<button class="btn btn-line" onclick="editingGroupId=null; render()">إلغاء التعديل</button>` : ''}
      </div>
    </div>
    <div class="card">
      <h3><span class="dot"></span> الأفواج (${Store.DB.groups.length})</h3>
      ${Store.DB.groups.length? `<table><thead><tr><th>اسم الفوج</th><th>عدد المتعلمين</th><th>المعلّم المسند</th><th></th></tr></thead>
      <tbody>${Store.DB.groups.map(g=>`
        <tr>
          <td>${g.name}</td>
          <td>${Store.DB.students.filter(s=>s.groupId===g.id).length}</td>
          <td>${(Store.DB.teachers||[]).filter(t=>(t.assignedGroupIds||[]).includes(g.id)).map(t=>t.name).join('، ') || '—'}</td>
          <td style="display:flex;gap:6px">
            <button class="btn btn-sm btn-gold" onclick="editingGroupId='${g.id}'; render(); window.scrollTo(0,0)">تعديل</button>
            <button class="btn btn-sm btn-danger" onclick="onDeleteGroup('${g.id}')">حذف</button>
          </td>
        </tr>`).join('')}</tbody></table>` : `<div class="empty">لا توجد أفواج بعد.</div>`}
    </div>
  `;
}
async function onSaveGroup(){
  const name = document.getElementById("ng-name").value.trim();
  if(!name) return toast("أدخل اسم الفوج أولاً");
  try{
    if(editingGroupId){ await Store.updateGroup(editingGroupId, {name}); toast("تم حفظ تعديلات الفوج"); editingGroupId=null; }
    else{ await Store.addGroup({name}); toast("تمت إضافة الفوج"); }
    render();
  }catch(e){ toast("تعذّر الحفظ: "+(e.message||e)); }
}
async function onDeleteGroup(id){
  if(!confirm("حذف هذا الفوج؟ سيبقى المتعلمون المرتبطون به بدون فوج.")) return;
  try{
    for(const s of Store.DB.students.filter(s=>s.groupId===id)) await Store.updateStudent(s.id, {groupId:null});
    await Store.deleteGroup(id);
    if(editingGroupId===id) editingGroupId=null;
    toast("تم حذف الفوج");
    render();
  }catch(e){ toast("تعذّر الحذف: "+(e.message||e)); }
}

// ===================== السنوات الدراسية =====================
function renderYears(root){
  const editing = editingYearId ? Store.DB.years.find(y=>y.id===editingYearId) : null;
  root.innerHTML = `
    <div class="card">
      <h3><span class="dot"></span> ${editing? 'تعديل السنة الدراسية: '+editing.name : 'إضافة سنة دراسية جديدة'}</h3>
      <div class="grid g3">
        <div class="field"><label>اسم السنة الدراسية</label><input id="ny-name" placeholder="مثال: 2026-2025" value="${editing?.name||''}"></div>
        <div class="field"><label>تاريخ البداية</label><input id="ny-start" type="date" value="${editing?.startDate||''}"></div>
        <div class="field"><label>تاريخ النهاية</label><input id="ny-end" type="date" value="${editing?.endDate||''}"></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn btn-primary" onclick="onSaveYear()">${editing? '💾 حفظ التعديلات' : 'إضافة السنة'}</button>
        ${editing? `<button class="btn btn-line" onclick="editingYearId=null; render()">إلغاء التعديل</button>` : ''}
      </div>
    </div>
    <div class="card">
      <h3><span class="dot"></span> السنوات الدراسية (${Store.DB.years.length})</h3>
      <p class="small-note">السنة "النشطة" هي التي تظهر بها بيانات المتعلمين والجلسات افتراضيًا في كامل المنصة.</p>
      ${Store.DB.years.length? `<table><thead><tr><th>الاسم</th><th>البداية</th><th>النهاية</th><th>الحالة</th><th></th></tr></thead>
      <tbody>${Store.DB.years.map(y=>`
        <tr>
          <td>${y.name}</td><td>${y.startDate||'—'}</td><td>${y.endDate||'—'}</td>
          <td>${y.active? '<span class="chip chip-good">نشطة</span>' : '<span class="chip chip-mid">أرشيف</span>'}</td>
          <td style="display:flex;gap:6px">
            ${!y.active? `<button class="btn btn-sm btn-primary" onclick="onSetActiveYear('${y.id}')">تفعيل</button>`:''}
            <button class="btn btn-sm btn-gold" onclick="editingYearId='${y.id}'; render(); window.scrollTo(0,0)">تعديل</button>
            <button class="btn btn-sm btn-danger" onclick="onDeleteYear('${y.id}')">حذف</button>
          </td>
        </tr>`).join('')}</tbody></table>` : `<div class="empty">لا توجد سنوات دراسية بعد. أضيفوا السنة الحالية للبدء.</div>`}
    </div>
  `;
}
async function onSaveYear(){
  const name = document.getElementById("ny-name").value.trim();
  const startDate = document.getElementById("ny-start").value;
  const endDate = document.getElementById("ny-end").value;
  if(!name) return toast("أدخل اسم السنة الدراسية");
  try{
    if(editingYearId){
      await Store.updateYear(editingYearId, {name,startDate,endDate});
      toast("تم حفظ التعديلات"); editingYearId=null;
    }else{
      const makeActive = !Store.DB.years.length;
      await Store.addYear({name,startDate,endDate,active:makeActive});
      toast("تمت إضافة السنة الدراسية");
    }
    render();
  }catch(e){ toast("تعذّر الحفظ: "+(e.message||e)); }
}
async function onSetActiveYear(id){
  try{
    for(const y of Store.DB.years.filter(y=>y.active)) await Store.updateYear(y.id, {active:false});
    await Store.updateYear(id, {active:true});
    toast("تم تفعيل السنة الدراسية");
    render();
  }catch(e){ toast("تعذّر التفعيل: "+(e.message||e)); }
}
async function onDeleteYear(id){
  if(!confirm("حذف هذه السنة الدراسية؟ لن يتم حذف بيانات المتعلمين المرتبطة بها.")) return;
  try{ await Store.deleteYear(id); toast("تم الحذف"); render(); }
  catch(e){ toast("تعذّر الحذف: "+(e.message||e)); }
}

// ===================== حسابات المعلّمين =====================
function renderTeachers(root){
  const editing = editingTeacherId ? (Store.DB.teachers||[]).find(t=>t.id===editingTeacherId) : null;
  root.innerHTML = `
    <div class="card">
      <h3><span class="dot"></span> إضافة حساب معلّم / مشرف حلقة جديد</h3>
      <div class="grid g3">
        <div class="field"><label>الاسم الكامل</label><input id="nt-name"></div>
        <div class="field"><label>البريد الإلكتروني</label><input id="nt-email" type="email"></div>
        <div class="field"><label>كلمة مرور مؤقتة</label><input id="nt-pass" placeholder="٦ أحرف على الأقل"></div>
      </div>
      <div class="field" style="margin-top:10px">
        <label>الأفواج المُسندة إليه</label>
        <div class="checks">
          ${Store.DB.groups.map(g=>`<label class="check-item"><input type="checkbox" value="${g.id}" class="nt-group-chk"> ${g.name}</label>`).join('') || '<span class="small-note">أنشئوا فوجًا أولًا من صفحة الأفواج.</span>'}
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="onCreateTeacher()">إنشاء حساب المعلّم</button>
      <p class="small-note" style="margin-top:8px">شاركوا البريد وكلمة المرور المؤقتة مع المعلّم؛ يمكنه تغييرها لاحقًا عبر "نسيت كلمة المرور" في شاشة الدخول.</p>
    </div>
    <div class="card">
      <h3><span class="dot"></span> المعلّمون (${(Store.DB.teachers||[]).length})</h3>
      ${(Store.DB.teachers||[]).length? (Store.DB.teachers).map(t=>`
        <div style="border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <div><b>${t.name}</b> <span class="small-note">${t.email}</span></div>
            <button class="btn btn-sm btn-line" onclick="AuthApiResetTeacher('${t.email}')">إرسال رابط إعادة تعيين كلمة المرور</button>
          </div>
          <div class="field" style="margin-top:10px">
            <label>الأفواج المُسندة</label>
            <div class="checks">
              ${Store.DB.groups.map(g=>`<label class="check-item"><input type="checkbox" value="${g.id}" ${((t.assignedGroupIds||[]).includes(g.id))?'checked':''} onchange="onToggleTeacherGroup('${t.id}', '${g.id}', this.checked)"> ${g.name}</label>`).join('') || '<span class="small-note">لا توجد أفواج بعد.</span>'}
            </div>
          </div>
        </div>
      `).join('') : `<div class="empty">لم يتم إنشاء أي حساب معلّم بعد.</div>`}
    </div>
  `;
}

async function onCreateTeacher(){
  const name = document.getElementById("nt-name").value.trim();
  const email = document.getElementById("nt-email").value.trim();
  const pass = document.getElementById("nt-pass").value;
  const groupIds = Array.from(document.querySelectorAll(".nt-group-chk:checked")).map(c=>c.value);
  if(!name || !email || !pass) return toast("الرجاء تعبئة جميع الحقول");
  if(pass.length < 6) return toast("كلمة المرور يجب ألا تقل عن 6 أحرف");
  try{
    await AuthApi.createTeacherAccount(name, email, pass, groupIds);
    toast("تم إنشاء حساب المعلّم بنجاح");
    render();
  }catch(e){ toast("تعذّر الإنشاء: "+(e.message||e)); }
}
async function onToggleTeacherGroup(teacherId, groupId, checked){
  const t = (Store.DB.teachers||[]).find(t=>t.id===teacherId);
  if(!t) return;
  let ids = t.assignedGroupIds || [];
  ids = checked? Array.from(new Set([...ids, groupId])) : ids.filter(i=>i!==groupId);
  try{ await AuthApi.updateTeacherGroups(teacherId, ids); toast("تم تحديث أفواج المعلّم"); }
  catch(e){ toast("تعذّر التحديث: "+(e.message||e)); }
}
async function AuthApiResetTeacher(email){
  try{ await AuthApi.resetPassword(email); toast("تم إرسال رابط إعادة التعيين إلى بريد المعلّم"); }
  catch(e){ toast("تعذّر الإرسال: "+(e.message||e)); }
}

// ===================== تسجيل الجلسة =====================
function startNewSession(){
  const student = studentById(activeStudentId);
  if(!student) return toast("اختر متعلمًا أولًا");
  sessionDraft = {
    id: uid(), studentId: student.id, yearId: student.yearId || activeYear()?.id || null,
    date: todayStr(), attendance: "حاضر",
    tracks: {hifz:true, murajaa:true, nazariyyah:true, talawah:true, arbaeen:false, adhkar:false},
    hifz: {surahFrom:SURAHS[0], ayahFrom:1, surahTo:SURAHS[0], ayahTo:1, evaluation:"",
      next: {surahFrom:SURAHS[0], ayahFrom:1, surahTo:SURAHS[0], ayahTo:1}},
    murajaa: {
      qareeb: {surahFrom:SURAHS[0], ayahFrom:1, surahTo:SURAHS[0], ayahTo:1, evaluation:""},
      baeed: {surahFrom:SURAHS[0], ayahFrom:1, surahTo:SURAHS[0], ayahTo:1, evaluation:""}
    },
    talawahNazariyyah: {matn:"تحفة الأطفال", baytFrom:"", baytTo:"", tajweedNoteTitle:""},
    talawah: {surahFrom:SURAHS[0], ayahFrom:1, surahTo:SURAHS[0], ayahTo:1, evaluation:"", details:{}},
    arbaeen: {number:1, evaluation:"", next:{number:2}},
    adhkar: {bab:ADHKAR[0].bab, evaluation:"", next:{bab:ADHKAR[0].bab}}
  };
  sessionTab = "hifz";
  switchView("session");
}

function toggleTrack(key, val){ sessionDraft.tracks[key] = val; render(); }

function upd(path, value){
  const parts = path.split(".");
  let o = sessionDraft;
  for(let i=0;i<parts.length-1;i++) o = o[parts[i]];
  o[parts[parts.length-1]] = value;
  render();
}

function renderSessionView(root){
  const list = scopeStudentsForView();
  if(!list.length){ root.innerHTML = `<div class="card"><div class="empty">لا يوجد متعلمون لتسجيل جلسة لهم.</div></div>`; return; }
  if(!activeStudentId) activeStudentId = list[0].id;
  if(!sessionDraft || sessionDraft.studentId !== activeStudentId) startNewSession();
  const d = sessionDraft;
  const includedCount = Object.values(d.tracks).filter(Boolean).length;
  root.innerHTML = `
    <div class="card">
      <div class="grid g3">
        <div class="field"><label>التاريخ</label><input type="date" id="sd-date" value="${d.date}"></div>
        <div class="field">
          <label>الحضور</label>
          <div class="attendance-row">
            <div class="att-opt ${d.attendance==='حاضر'?'sel-present':''}" onclick="setAttendance('حاضر')">حاضر</div>
            <div class="att-opt ${d.attendance==='متأخر'?'sel-late':''}" onclick="setAttendance('متأخر')">متأخر</div>
            <div class="att-opt ${d.attendance==='غائب'?'sel-absent':''}" onclick="setAttendance('غائب')">غائب</div>
          </div>
        </div>
      </div>
      <p class="small-note" style="margin-top:12px">اختر مسارًا واحدًا أو أكثر لهذه الجلسة عبر مفتاح "تضمين" أعلى كل مسار — لا يشترط تسجيل المسارات الستة معًا.</p>
    </div>

    <div class="tabs no-print">
      ${Object.keys(TRACK_META).map(k=>tabBtn(k)).join('')}
    </div>

    <div class="card">${ sessionTab==='hifz' ? hifzForm(d) : sessionTab==='murajaa' ? murajaaForm(d) : sessionTab==='nazariyyah' ? nazariyyahForm(d) : sessionTab==='talawah' ? talawahForm(d) : sessionTab==='arbaeen' ? arbaeenForm(d) : adhkarForm(d) }</div>

    <div style="display:flex; gap:10px; align-items:center">
      <button class="btn btn-primary" onclick="saveSessionDraft()">💾 حفظ الجلسة</button>
      <button class="btn btn-line" onclick="sessionDraft=null; switchView('dashboard')">إلغاء</button>
      <span class="small-note">${includedCount} من ${Object.keys(TRACK_META).length} مسارات مُضمَّنة</span>
    </div>
  `;
}

async function saveSessionDraft(){
  const included = Object.entries(sessionDraft.tracks).filter(([,v])=>v).map(([k])=>k);
  if(included.length===0) return toast("فعّل مسارًا واحدًا على الأقل قبل الحفظ");
  sessionDraft.date = document.getElementById("sd-date")?.value || sessionDraft.date;
  Object.keys(TRACK_META).forEach(key=>{
    const field = TRACK_META[key].field;
    if(!sessionDraft.tracks[key]) sessionDraft[field] = null;
  });
  const {id, ...data} = sessionDraft;
  try{
    await Store.addSession(data);
    toast("تم حفظ الجلسة");
    sessionDraft = null;
    switchView("history");
  }catch(e){ toast("تعذّر الحفظ: "+(e.message||e)); }
}

// ===================== السجل =====================
function renderHistory(root){
  const list = scopeStudentsForView();
  if(!list.length){ root.innerHTML = `<div class="card"><div class="empty">لا يوجد متعلمون.</div></div>`; return; }
  const student = studentById(activeStudentId) || list[0];
  const sess = studentSessions(student.id);
  root.innerHTML = `
    <div class="card">
      <h3><span class="dot"></span> سجل جلسات: ${student.name}</h3>
      ${sess.length? sess.map(s=>`
        <div style="border:1px solid var(--line); border-radius:10px; padding:12px 14px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${s.date}</b>
            <span class="chip ${s.attendance==='حاضر'?'chip-good': s.attendance==='متأخر'?'chip-mid':'chip-bad'}">${s.attendance}</span>
          </div>
          <div style="margin-top:8px">${renderSessionSummary(s)}</div>
        </div>
      `).join('') : `<div class="empty">لا توجد جلسات مسجّلة بعد لهذا المتعلم.</div>`}
    </div>
  `;
}

// ===================== الاختبارات والفروض والتقويم المستمر =====================
const EXAM_TERMS = ["الفصل الأول","الفصل الثاني","الفصل الثالث"];
const EXAM_TYPES = ["اختبار","فرض","تقويم مستمر"];
const EXAM_TRACKS = ["عام", ...Object.values(TRACK_META).map(t=>t.label)];

function renderExams(root){
  const list = scopeStudentsForView();
  const editing = editingExamId ? Store.DB.exams.find(e=>e.id===editingExamId) : null;
  root.innerHTML = `
    <div class="card">
      <h3><span class="dot"></span> ${editing? 'تعديل نتيجة':'تسجيل نتيجة اختبار / فرض / تقويم مستمر'}</h3>
      <div class="grid g3">
        <div class="field"><label>المتعلم</label>
          <select id="ex-student">${list.map(s=>`<option value="${s.id}" ${(editing?.studentId||activeStudentId)===s.id?'selected':''}>${s.name} (${s.code})</option>`).join('')}</select>
        </div>
        <div class="field"><label>الفصل الدراسي</label>
          <select id="ex-term">${EXAM_TERMS.map(t=>`<option ${((editing?.term)||EXAM_TERMS[0])===t?'selected':''}>${t}</option>`).join('')}</select>
        </div>
        <div class="field"><label>نوع التقييم</label>
          <select id="ex-type">${EXAM_TYPES.map(t=>`<option ${((editing?.type)||EXAM_TYPES[0])===t?'selected':''}>${t}</option>`).join('')}</select>
        </div>
        <div class="field"><label>المسار</label>
          <select id="ex-track">${EXAM_TRACKS.map(t=>`<option ${((editing?.track)||EXAM_TRACKS[0])===t?'selected':''}>${t}</option>`).join('')}</select>
        </div>
        <div class="field"><label>عنوان الاختبار (اختياري)</label><input id="ex-title" value="${editing?.title||''}" placeholder="مثال: اختبار حفظ سورة الكهف"></div>
        <div class="field"><label>التاريخ</label><input id="ex-date" type="date" value="${editing?.date||todayStr()}"></div>
        <div class="field"><label>النقطة المحصّلة</label><input id="ex-score" type="number" step="0.25" value="${editing?.score??''}"></div>
        <div class="field"><label>النقطة القصوى</label><input id="ex-max" type="number" step="0.25" value="${editing?.maxScore??20}"></div>
      </div>
      <div class="field"><label>ملاحظات</label><textarea id="ex-notes" rows="2">${editing?.notes||''}</textarea></div>
      <div style="display:flex;gap:10px;margin-top:10px">
        <button class="btn btn-primary" onclick="onSaveExam()">${editing?'💾 حفظ التعديلات':'تسجيل النتيجة'}</button>
        ${editing?`<button class="btn btn-line" onclick="editingExamId=null; render()">إلغاء</button>`:''}
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:10px">
        <h3 style="margin:0"><span class="dot"></span> النتائج المسجّلة</h3>
        <div style="display:flex;gap:8px" class="no-print">
          <select onchange="examStudentFilter=this.value; render()">
            <option value="">كل المتعلمين</option>
            ${list.map(s=>`<option value="${s.id}" ${examStudentFilter===s.id?'selected':''}>${s.name}</option>`).join('')}
          </select>
          <select onchange="examTermFilter=this.value; render()">
            <option value="">كل الفصول</option>
            ${EXAM_TERMS.map(t=>`<option ${examTermFilter===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      ${(()=>{
        let ex = Store.DB.exams.filter(e=> list.some(s=>s.id===e.studentId));
        if(examStudentFilter) ex = ex.filter(e=>e.studentId===examStudentFilter);
        if(examTermFilter) ex = ex.filter(e=>e.term===examTermFilter);
        ex.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
        return ex.length? `<table><thead><tr><th>التاريخ</th><th>المتعلم</th><th>الفصل</th><th>النوع</th><th>المسار</th><th>العنوان</th><th>النقطة</th><th></th></tr></thead>
        <tbody>${ex.map(e=>`
          <tr>
            <td>${e.date}</td><td>${studentById(e.studentId)?.name||'—'}</td><td>${e.term}</td><td>${e.type}</td><td>${e.track}</td><td>${e.title||'—'}</td>
            <td><b>${e.score}</b> / ${e.maxScore}</td>
            <td style="display:flex;gap:6px">
              <button class="btn btn-sm btn-gold" onclick="editingExamId='${e.id}'; render(); window.scrollTo(0,0)">تعديل</button>
              <button class="btn btn-sm btn-danger" onclick="onDeleteExam('${e.id}')">حذف</button>
            </td>
          </tr>`).join('')}</tbody></table>` : `<div class="empty">لا توجد نتائج مسجّلة بعد.</div>`;
      })()}
    </div>
  `;
}
async function onSaveExam(){
  const studentId = document.getElementById("ex-student").value;
  const term = document.getElementById("ex-term").value;
  const type = document.getElementById("ex-type").value;
  const track = document.getElementById("ex-track").value;
  const title = document.getElementById("ex-title").value.trim();
  const date = document.getElementById("ex-date").value || todayStr();
  const score = parseFloat(document.getElementById("ex-score").value);
  const maxScore = parseFloat(document.getElementById("ex-max").value) || 20;
  const notes = document.getElementById("ex-notes").value.trim();
  if(!studentId) return toast("اختر متعلمًا");
  if(isNaN(score)) return toast("أدخل النقطة المحصّلة");
  const st = studentById(studentId);
  const data = {studentId, groupId: st?.groupId||null, yearId: st?.yearId||activeYear()?.id||null, term, type, track, title, date, score, maxScore, notes};
  try{
    if(editingExamId){ await Store.updateExam(editingExamId, data); toast("تم حفظ التعديلات"); editingExamId=null; }
    else{ await Store.addExam(data); toast("تم تسجيل النتيجة"); }
    render();
  }catch(e){ toast("تعذّر الحفظ: "+(e.message||e)); }
}
async function onDeleteExam(id){
  if(!confirm("حذف هذه النتيجة؟")) return;
  try{ await Store.deleteExam(id); toast("تم الحذف"); render(); }
  catch(e){ toast("تعذّر الحذف: "+(e.message||e)); }
}

// ===================== كشف النتائج الفصلي =====================
function renderClassSheet(root){
  const groups = isAdmin()? Store.DB.groups : Store.DB.groups.filter(g=> (currentUser.profile.assignedGroupIds||[]).includes(g.id));
  if(!classSheetGroupId && groups.length) classSheetGroupId = groups[0].id;
  const students = scopeStudentsForView().filter(s=>s.groupId===classSheetGroupId);
  const rows = students.map(s=>{
    const ex = Store.DB.exams.filter(e=>e.studentId===s.id && e.term===classSheetTerm);
    const byType = {};
    EXAM_TYPES_SAFE().forEach(t=> byType[t] = ex.filter(e=>e.type===t));
    const avgOf = list => list.length? (list.reduce((a,e)=> a + (e.score/e.maxScore*20), 0)/list.length) : null;
    const overall = avgOf(ex);
    return {student:s, byType, overall};
  });
  root.innerHTML = `
    <div class="card no-print">
      <h3><span class="dot"></span> كشف النتائج الفصلي</h3>
      <div class="grid g3">
        <div class="field"><label>الفوج</label>
          <select onchange="classSheetGroupId=this.value; render()">${groups.map(g=>`<option value="${g.id}" ${classSheetGroupId===g.id?'selected':''}>${g.name}</option>`).join('') || '<option>لا توجد أفواج</option>'}</select>
        </div>
        <div class="field"><label>الفصل الدراسي</label>
          <select onchange="classSheetTerm=this.value; render()">${EXAM_TERMS.map(t=>`<option ${classSheetTerm===t?'selected':''}>${t}</option>`).join('')}</select>
        </div>
      </div>
      <button class="btn btn-gold" style="margin-top:10px" onclick="window.print()">🖨️ طباعة الكشف</button>
    </div>
    <div class="card">
      <div class="print-header">
        <div>
          <div class="small-note" style="font-weight:700">المدرسة النموذجية النهضة بالقرآن الكريم</div>
          <h2 style="margin:4px 0 0">كشف نتائج ${classSheetTerm} — فوج: ${groupName(classSheetGroupId)}</h2>
        </div>
        <div class="small-note">تاريخ الإصدار: ${todayStr()}</div>
      </div>
      <h3 class="no-print"><span class="dot"></span> النتائج (على ٢٠)</h3>
      ${rows.length? `<table><thead><tr><th>الرقم التعريفي</th><th>الاسم</th>${EXAM_TYPES_SAFE().map(t=>`<th>${t}</th>`).join('')}<th>المعدل العام</th></tr></thead>
      <tbody>${rows.map(r=>`
        <tr>
          <td style="font-family:monospace">${r.student.code}</td>
          <td>${r.student.name}</td>
          ${EXAM_TYPES_SAFE().map(t=>{
            const list = r.byType[t];
            const avg = list.length? (list.reduce((a,e)=>a+(e.score/e.maxScore*20),0)/list.length).toFixed(1) : '—';
            return `<td>${avg}</td>`;
          }).join('')}
          <td><b>${r.overall!=null? r.overall.toFixed(1) : '—'}</b></td>
        </tr>`).join('')}</tbody></table>` : `<div class="empty">لا يوجد متعلمون في هذا الفوج ضمن نطاقك.</div>`}
    </div>
  `;
}
function EXAM_TYPES_SAFE(){ return typeof EXAM_TYPES!=="undefined"? EXAM_TYPES : ["اختبار","فرض","تقويم مستمر"]; }

// ===================== الاشتراكات =====================
const PAY_STATUSES = ["مدفوع","غير مدفوع","متأخر"];

function renderPayments(root){
  const students = Store.DB.students;
  root.innerHTML = `
    <div class="card">
      <h3><span class="dot"></span> تسجيل دفعة اشتراك</h3>
      <div class="grid g3">
        <div class="field"><label>المتعلم</label>
          <select id="pm-student">${students.map(s=>`<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}</select>
        </div>
        <div class="field"><label>الفترة (شهر/فصل)</label><input id="pm-period" placeholder="مثال: يناير 2026"></div>
        <div class="field"><label>المبلغ</label><input id="pm-amount" type="number"></div>
        <div class="field"><label>الحالة</label>
          <select id="pm-status">${PAY_STATUSES.map(s=>`<option>${s}</option>`).join('')}</select>
        </div>
        <div class="field"><label>تاريخ الدفع</label><input id="pm-date" type="date" value="${todayStr()}"></div>
        <div class="field"><label>ملاحظات</label><input id="pm-notes"></div>
      </div>
      <button class="btn btn-primary" style="margin-top:10px" onclick="onSavePayment()">تسجيل الدفعة</button>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:10px">
        <h3 style="margin:0"><span class="dot"></span> سجل الاشتراكات</h3>
        <div style="display:flex;gap:8px" class="no-print">
          <select onchange="paymentStudentFilter=this.value; render()">
            <option value="">كل المتعلمين</option>
            ${students.map(s=>`<option value="${s.id}" ${paymentStudentFilter===s.id?'selected':''}>${s.name}</option>`).join('')}
          </select>
          <select onchange="paymentStatusFilter=this.value; render()">
            <option value="">كل الحالات</option>
            ${PAY_STATUSES.map(s=>`<option ${paymentStatusFilter===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      ${(()=>{
        let list = Store.DB.payments.slice();
        if(paymentStudentFilter) list = list.filter(p=>p.studentId===paymentStudentFilter);
        if(paymentStatusFilter) list = list.filter(p=>p.status===paymentStatusFilter);
        list.sort((a,b)=>(b.paidDate||"").localeCompare(a.paidDate||""));
        const statusClass = {"مدفوع":"pay-paid","غير مدفوع":"pay-due","متأخر":"pay-late"};
        return list.length? `<table><thead><tr><th>المتعلم</th><th>الفترة</th><th>المبلغ</th><th>الحالة</th><th>تاريخ الدفع</th><th>ملاحظات</th><th></th></tr></thead>
        <tbody>${list.map(p=>`
          <tr>
            <td>${studentById(p.studentId)?.name||'—'}</td><td>${p.period}</td><td>${p.amount||'—'}</td>
            <td><span class="chip ${statusClass[p.status]||'chip-mid'}">${p.status}</span></td>
            <td>${p.paidDate||'—'}</td><td>${p.notes||'—'}</td>
            <td><button class="btn btn-sm btn-danger" onclick="onDeletePayment('${p.id}')">حذف</button></td>
          </tr>`).join('')}</tbody></table>` : `<div class="empty">لا توجد سجلات اشتراك بعد.</div>`;
      })()}
    </div>
  `;
}
async function onSavePayment(){
  const studentId = document.getElementById("pm-student").value;
  const period = document.getElementById("pm-period").value.trim();
  const amount = parseFloat(document.getElementById("pm-amount").value) || 0;
  const status = document.getElementById("pm-status").value;
  const paidDate = document.getElementById("pm-date").value;
  const notes = document.getElementById("pm-notes").value.trim();
  if(!studentId || !period) return toast("اختر المتعلم وأدخل الفترة");
  const st = studentById(studentId);
  try{
    await Store.addPayment({studentId, yearId: st?.yearId||activeYear()?.id||null, period, amount, status, paidDate, notes});
    toast("تم تسجيل الدفعة"); render();
  }catch(e){ toast("تعذّر الحفظ: "+(e.message||e)); }
}
async function onDeletePayment(id){
  if(!confirm("حذف سجل هذه الدفعة؟")) return;
  try{ await Store.deletePayment(id); toast("تم الحذف"); render(); }
  catch(e){ toast("تعذّر الحذف: "+(e.message||e)); }
}

// ===================== التقارير =====================
let reportRange = "day";
function renderReports(root){
  const list = scopeStudentsForView();
  if(!list.length){ root.innerHTML = `<div class="card"><div class="empty">لا يوجد متعلمون.</div></div>`; return; }
  const student = studentById(activeStudentId) || list[0];
  const st = computeStats(student.id, reportRange);
  const label = {day:"يومي", week:"أسبوعي", month:"شهري"}[reportRange];
  const exams = studentExams(student.id);
  root.innerHTML = `
    <div class="print-header">
      <div>
      <div class="small-note" style="font-weight:700">المدرسة النموذجية النهضة بالقرآن الكريم</div>
      <h2 style="margin:4px 0 0">تقرير ${label} — حلقة تحفيظ القرآن الكريم</h2>
      <div class="small-note">المتعلم: ${student.name} (${student.code}) · السن: ${student.age||'—'} · المستوى: ${student.level||'—'} · الفوج: ${groupName(student.groupId)}</div></div>
      <div class="small-note">تاريخ الإصدار: ${todayStr()}</div>
    </div>
    <div class="tabs no-print">
      <div class="tab-btn ${reportRange==='day'?'active':''}" onclick="reportRange='day'; render()">يومي</div>
      <div class="tab-btn ${reportRange==='week'?'active':''}" onclick="reportRange='week'; render()">أسبوعي</div>
      <div class="tab-btn ${reportRange==='month'?'active':''}" onclick="reportRange='month'; render()">شهري</div>
      <button class="btn btn-gold btn-sm" style="margin-right:auto" onclick="window.print()">🖨️ طباعة</button>
    </div>

    <div class="grid g4">
      <div class="card stat-card"><div class="stat-num">${st.count}</div><div class="stat-lbl">عدد الجلسات</div></div>
      <div class="card stat-card"><div class="stat-num">${st.present}</div><div class="stat-lbl">حضور</div></div>
      <div class="card stat-card"><div class="stat-num">${st.late}</div><div class="stat-lbl">تأخر</div></div>
      <div class="card stat-card"><div class="stat-num">${st.absent}</div><div class="stat-lbl">غياب</div></div>
    </div>

    <div class="card">
      <h3><span class="dot"></span>تفصيل الجلسات ضمن الفترة</h3>
      ${st.sessions.length? `<table><thead><tr><th>التاريخ</th><th>الحضور</th><th>الحفظ</th><th>المراجعة (قريب/بعيد)</th><th>التلاوة</th><th>الأربعون النووية</th><th>الأذكار</th></tr></thead>
      <tbody>${st.sessions.map(s=>`
        <tr>
          <td>${s.date}</td>
          <td>${s.attendance}</td>
          <td>${s.hifz?.surahFrom? surahRangeLabel(s.hifz)+' '+evalChip(s.hifz.evaluation): '—'}</td>
          <td>${(s.murajaa?.qareeb?.surahFrom? evalChip(s.murajaa.qareeb.evaluation):'')} ${(s.murajaa?.baeed?.surahFrom? evalChip(s.murajaa.baeed.evaluation):'')}</td>
          <td>${s.talawah?.surahFrom? evalChip(s.talawah.evaluation): '—'}</td>
          <td>${s.arbaeen?.number? 'ح'+s.arbaeen.number+' '+evalChip(s.arbaeen.evaluation): '—'}</td>
          <td>${s.adhkar?.bab? evalChip(s.adhkar.evaluation): '—'}</td>
        </tr>`).join('')}</tbody></table>` : `<div class="empty">لا توجد جلسات ضمن هذه الفترة.</div>`}
    </div>

    <div class="card">
      <h3><span class="dot"></span>نتائج الاختبارات والفروض والتقويم المستمر</h3>
      ${exams.length? `<table><thead><tr><th>التاريخ</th><th>الفصل</th><th>النوع</th><th>المسار</th><th>النقطة</th></tr></thead>
      <tbody>${exams.map(e=>`<tr><td>${e.date}</td><td>${e.term}</td><td>${e.type}</td><td>${e.track}</td><td><b>${e.score}</b>/${e.maxScore}</td></tr>`).join('')}</tbody></table>`
      : `<div class="empty">لا توجد نتائج مسجّلة بعد.</div>`}
    </div>
  `;
}

// ===================== الإحصائيات =====================
function renderStats(root){
  const list = scopeStudentsForView();
  if(!list.length){ root.innerHTML = `<div class="card"><div class="empty">لا يوجد متعلمون.</div></div>`; return; }
  const student = studentById(activeStudentId) || list[0];
  const st = computeStats(student.id, "all");
  function bars(obj, colorMap){
    const total = Object.values(obj).reduce((a,b)=>a+b,0) || 1;
    return Object.entries(obj).map(([k,v])=>`
      <div class="bar-row">
        <div class="bar-label">${k}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(v/total*100).toFixed(0)}%; background:${colorMap[k]||'var(--palm)'}"></div></div>
        <div class="bar-val">${v}</div>
      </div>`).join('') || '<div class="small-note">لا بيانات</div>';
  }
  const colors = {"جيد":"var(--good)","جيدة":"var(--good)","متوسط":"var(--gold)","متوسطة":"var(--gold)","ضعيف":"var(--bad)","ضعيفة":"var(--bad)","ضعيف يعاد":"var(--bad)","ضعيف يحتاج إعادة":"var(--bad)","يحتاج إلى إعادة":"var(--bad)"};
  root.innerHTML = `
    <div class="grid g3">
      <div class="card"><h3><span class="dot"></span>الحفظ</h3>${bars(st.evalCount.hifz, colors)}</div>
      <div class="card"><h3><span class="dot"></span>المراجعة</h3>${bars(st.evalCount.murajaa, colors)}</div>
      <div class="card"><h3><span class="dot"></span>التلاوة</h3>${bars(st.evalCount.talawah, colors)}</div>
      <div class="card"><h3><span class="dot"></span>الأربعون النووية</h3>${bars(st.evalCount.arbaeen, colors)}</div>
      <div class="card"><h3><span class="dot"></span>الأذكار</h3>${bars(st.evalCount.adhkar, colors)}</div>
    </div>
    <div class="card">
      <h3><span class="dot"></span>الحضور الإجمالي</h3>
      ${bars({"حاضر":st.present, "متأخر":st.late, "غائب":st.absent}, {"حاضر":"var(--good)","متأخر":"var(--gold)","غائب":"var(--bad)"})}
    </div>
  `;
}

// ===================== بوابة أولياء الأمور =====================
function renderParentPortal(root){
  document.getElementById("navItems").innerHTML = `<button class="nav-btn active"><span class="n">◆</span> متابعة أبنائي</button>`;
  const sel = document.getElementById("student-select");
  const av = document.getElementById("avatar-letter");
  if(sel) sel.style.display="none";
  if(av) av.style.display="none";

  const children = Store.DB.students;
  if(!children.length){
    root.innerHTML = `<div class="card"><div class="empty"><div class="big">👪</div>لم يتم ربط أي ابن بعد.</div></div>` + linkAnotherChildCard();
    return;
  }
  if(!parentChildId || !children.some(c=>c.id===parentChildId)) parentChildId = children[0].id;
  const student = children.find(c=>c.id===parentChildId);
  const sess = studentSessions(student.id);
  const exams = studentExams(student.id);
  const payments = studentPayments(student.id);
  const st7 = computeStats(student.id, "week");

  root.innerHTML = `
    ${children.length>1? `<div class="tabs no-print">${children.map(c=>`<div class="tab-btn ${parentChildId===c.id?'active':''}" onclick="parentChildId='${c.id}'; render()">${c.name}</div>`).join('')}</div>` : ''}

    <div class="card">
      <h3><span class="dot"></span> بطاقة ${student.name}</h3>
      <div class="grid g3">
        <div><label>الرقم التعريفي</label><div style="font-family:monospace">${student.code}</div></div>
        <div><label>السن</label><div>${student.age||'—'}</div></div>
        <div><label>المستوى</label><div>${student.level||'—'}</div></div>
        <div><label>الفوج</label><div>${groupName(student.groupId)}</div></div>
        <div><label>السنة الدراسية</label><div>${yearLabel(student.yearId)}</div></div>
      </div>
    </div>

    <div class="grid g4">
      <div class="card stat-card"><div class="stat-num">${sess.length}</div><div class="stat-lbl">مجموع الجلسات</div></div>
      <div class="card stat-card"><div class="stat-num">${st7.present}</div><div class="stat-lbl">حضور آخر ٧ أيام</div></div>
      <div class="card stat-card"><div class="stat-num">${st7.absent}</div><div class="stat-lbl">غياب آخر ٧ أيام</div></div>
      <div class="card stat-card"><div class="stat-num">${sess[0]? sess[0].date : '—'}</div><div class="stat-lbl">آخر جلسة</div></div>
    </div>

    <div class="card">
      <h3><span class="dot"></span> آخر جلسة مسجّلة</h3>
      ${sess[0]? renderSessionSummary(sess[0]) : `<div class="empty">لا توجد جلسات مسجّلة بعد.</div>`}
    </div>

    <div class="card">
      <h3><span class="dot"></span> سجل الحضور والجلسات</h3>
      ${sess.length? sess.slice(0,15).map(s=>`
        <div style="border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between"><b>${s.date}</b><span class="chip ${s.attendance==='حاضر'?'chip-good': s.attendance==='متأخر'?'chip-mid':'chip-bad'}">${s.attendance}</span></div>
        </div>`).join('') : `<div class="empty">لا يوجد سجل بعد.</div>`}
    </div>

    <div class="card">
      <h3><span class="dot"></span> نتائج الاختبارات والفروض</h3>
      ${exams.length? `<table><thead><tr><th>التاريخ</th><th>الفصل</th><th>النوع</th><th>المسار</th><th>النقطة</th></tr></thead>
      <tbody>${exams.map(e=>`<tr><td>${e.date}</td><td>${e.term}</td><td>${e.type}</td><td>${e.track}</td><td><b>${e.score}</b>/${e.maxScore}</td></tr>`).join('')}</tbody></table>`
      : `<div class="empty">لا توجد نتائج مسجّلة بعد.</div>`}
    </div>

    <div class="card">
      <h3><span class="dot"></span> حالة الاشتراك</h3>
      ${payments.length? `<table><thead><tr><th>الفترة</th><th>المبلغ</th><th>الحالة</th><th>تاريخ الدفع</th></tr></thead>
      <tbody>${payments.map(p=>{
        const cls = {"مدفوع":"pay-paid","غير مدفوع":"pay-due","متأخر":"pay-late"}[p.status]||'chip-mid';
        return `<tr><td>${p.period}</td><td>${p.amount||'—'}</td><td><span class="chip ${cls}">${p.status}</span></td><td>${p.paidDate||'—'}</td></tr>`;
      }).join('')}</tbody></table>` : `<div class="empty">لا توجد سجلات اشتراك بعد.</div>`}
    </div>

    ${linkAnotherChildCard()}
  `;
}

function linkAnotherChildCard(){
  return `
    <div class="card">
      <h3><span class="dot"></span> ربط ابن آخر</h3>
      <div class="grid g3">
        <div class="field"><label>الرقم التعريفي للمتعلم</label><input id="lk2-code" placeholder="مثال: NHD-482913"></div>
        <div class="field"><label>تاريخ ميلاد المتعلم</label><input id="lk2-bdate" type="date"></div>
      </div>
      <button class="btn btn-primary" style="margin-top:10px" onclick="onLinkAnotherChild()">ربط</button>
    </div>
  `;
}
async function onLinkAnotherChild(){
  const code = document.getElementById("lk2-code").value.trim();
  const bdate = document.getElementById("lk2-bdate").value;
  if(!code || !bdate) return toast("أدخل الرقم التعريفي وتاريخ الميلاد");
  try{
    const sid = await AuthApi.linkParentToStudent(currentUser.uid, code, bdate);
    currentUser.profile = await AuthApi.getUserProfile(currentUser.uid);
    Store.startListeners(currentUser, ()=>render());
    parentChildId = sid;
    toast("تم ربط الابن بنجاح");
    render();
  }catch(e){ toast("تعذّر الربط: "+(e.message||e)); }
}
