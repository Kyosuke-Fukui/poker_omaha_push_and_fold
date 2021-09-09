const Hand = class {
    constructor() {
        this.num_list = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
        this.rank = ''
        this.score = 0
    }

    check_hand = (distributedCard, comunityCard) => {
        let rank_array = []
        let score_array = []
        let hands_combo = []

        hands_combo = new Set(
            combination(distributedCard, 2)
                .map(e0 => [...new Set(combination(comunityCard, 3))].map(e1 => (e0.concat(e1))))
                .reduce((acc, e) => ([...acc, ...e]), []));

        hands_combo.forEach((hand) => {
            // console.log(hand); //["As", "3d", "4c", "5s", "2c"]
            const num_array = hand.map((e) => this.num_list.findIndex((ele) => ele == e.substr(0, 1)) + 2)
            const suit_array = hand.map((e) => e.substr(1, 1))
            // console.log('num_array: ' + num_array); //[14, 3, 4, 5, 2]
            // console.log(suit_array); //["s", "d", "c", "s", "c"]

            //各数字の出現回数
            let num_counts = {}
            num_array.forEach(element => {
                num_counts[element] = (num_counts[element]) ? num_counts[element] + 1 : 1;
            });
            //各スートの出現回数
            let suit_counts = {}
            suit_array.forEach(element => {
                suit_counts[element] = (suit_counts[element]) ? suit_counts[element] + 1 : 1;
            });
            const rnum = num_array.map((e) => num_counts[e])
            const rsuit = suit_array.map((e) => suit_counts[e]) //[2, 1, 2, 2, 2]
            const dif = Math.max(...num_array) - Math.min(...num_array)
            // console.log('rnum: ' + rnum); //[1, 1, 1, 1, 1]
            // console.log('rsuit: ' + rsuit); //[2, 1, 2, 2, 2]
            // console.log(dif); //12

            let rank, score
            //判定
            if (Math.max(...rsuit) == 5) {
                if (num_array.sort((a, b) => a - b) == [10, 11, 12, 13, 14]) {
                    rank = 'royalflush'
                    score = 135
                } else if (dif == 4 && Math.max(...rnum) == 1) {
                    rank = 'straightflush'
                    score = 120 + Math.max(...num_array)
                } else if (this.compare_array(num_array.sort((a, b) => a - b), [2, 3, 4, 5, 14])) {
                    rank = 'straightflush'
                    score = 125
                } else {
                    rank = 'flush'
                    score = 75 + Math.max(...num_array) / 100
                }
            } else if (Math.max(...rnum) == 4) {
                rank = 'four card'
                score = this.check_fourcard(num_array, rnum)
            } else if (this.compare_array(rnum.slice().sort((a, b) => a - b), [2, 2, 3, 3, 3])) {
                rank = 'fullhouse'
                score = this.check_fullhouse(num_array, rnum)
            } else if (Math.max(...rnum) == 3) {
                rank = 'three card'
                score = this.check_threecard(num_array, rnum)
            } else if (this.count_pair(rnum) == 4) {
                rank = 'two pair'
                score = this.check_twopair(num_array, rnum)
            } else if (this.count_pair(rnum) == 2) {
                rank = 'one pair'
                score = this.check_onepair(num_array, rnum)
            } else if (dif == 4 && Math.max(...rnum) == 1) {
                rank = 'straight'
                score = 60 + Math.max(...num_array)
            } else if (this.compare_array(num_array.sort((a, b) => a - b), [2, 3, 4, 5, 14])) {
                rank = 'straight'
                score = 65
            } else {
                rank = 'high card'
                num_array.sort((a, b) => a - b)
                score = num_array[4] + num_array[3] / 100 + num_array[2] / 1000 + num_array[1] / 10000 + num_array[0] / 100000
            }
            rank_array.push(rank)
            score_array.push(score)
        })

        //最大スコアの役を成立役とする
        let index = 0
        let value = 0
        for (let i = 0; i < score_array.length; i++) {
            if (value < score_array[i]) {
                value = score_array[i]
                index = i
            }
        }
        this.rank = rank_array[index]
        this.score = score_array[index]
    }


    check_fourcard = (num_array, rnum) => {
        let four, kicker
        for (let i = 0; i < num_array.length; i++) {
            if (rnum[i] == 4) {
                four = num_array[i]
            } else {
                kicker = num_array[i]
            }
        }
        const score = 105 + four + kicker / 100
        return score
    }

    check_fullhouse = (num_array, rnum) => {
        let trio, pair
        for (let i = 0; i < num_array.length; i++) {
            if (rnum[i] == 3) {
                trio = num_array[i]
            } else {
                pair = num_array[i]
            }
        }
        const score = 90 + trio + pair / 100
        return score
    }

    check_threecard = (num_array, rnum) => {
        let trio
        let kicker = []
        for (let i = 0; i < num_array.length; i++) {
            if (rnum[i] == 3) {
                trio = num_array[i]
            } else {
                kicker.push(num_array[i])
            }
        }
        const score = 45 + trio + Math.max(...kicker) / 100 + Math.min(...kicker) / 1000
        return score
    }

    count_pair = (rnum) => {
        let count = 0
        rnum.forEach((e) => {
            if (e == 2) {
                count += 1
            }
        })
        return count
    }

    check_twopair = (num_array, rnum) => {
        let pairs = []
        let kicker
        for (let i = 0; i < num_array.length; i++) {
            if (rnum[i] == 2) {
                pairs.push(num_array[i])
            } else {
                kicker = num_array[i]
            }
        }
        const score = 30 + Math.max(...pairs) + Math.min(...pairs) / 100 + kicker / 1000
        return score
    }

    check_onepair = (num_array, rnum) => {
        let pair = []
        let kicker = []
        for (let i = 0; i < num_array.length; i++) {
            if (rnum[i] == 2) {
                pair.push(num_array[i])
            } else {
                kicker.push(num_array[i])
            }
        }
        kicker.sort((a, b) => b - a)
        const score = 15 + pair[0] + kicker[0] / 100 + kicker[1] / 1000 + kicker[2] / 10000
        return score
    }

    compare_array = (arr1, arr2) => {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        return true
    }

    check_flushdraw = (hand) => {
        const suit_array = hand.map((e) => e.substr(1, 1))
        this.flushdraw = ''
        //各スートの出現回数
        let suit_counts = {}
        suit_array.forEach(element => {
            suit_counts[element] = (suit_counts[element]) ? suit_counts[element] + 1 : 1;
        });
        const rsuit = suit_array.map((e) => suit_counts[e])

        //判定
        if (Math.max(...rsuit) >= 5) {
            this.flushdraw = 'flush'
        } else if (hand.length <= 6 && Math.max(...rsuit) == 4) {
            this.flushdraw = 'flush draw'
        } else if (hand.length == 5 && Math.max(...rsuit) == 3) {
            this.flushdraw = 'backdoor flush draw'
        }
    }

    check_straightdraw = (hand) => {
        const num_array = hand.map((e) => this.num_list.findIndex((ele) => ele == e.substr(0, 1)) + 2)
        //数字の重複を除いたもの
        const new_array = Array.from(new Set(num_array))
        this.straightdraw = []
        //重複除く数字が4つ以上の場合（役完成除く）、ストレートドローの判定処理
        if (new_array.length >= 4 && this.rank != 'straightflush' && this.rank != 'straight') {
            //配列のうち4つを取り出し判定する処理を全ての組み合わせで行う
            const array_combi = combination(new_array, 4)
            array_combi.forEach((e) => {
                const dif = Math.max(...e) - Math.min(...e)
                //判定
                if (this.compare_array(e.sort((a, b) => a - b), [2, 3, 4, 14]) |
                    this.compare_array(e.sort((a, b) => a - b), [2, 3, 5, 14]) |
                    this.compare_array(e.sort((a, b) => a - b), [2, 4, 5, 14]) |
                    this.compare_array(e.sort((a, b) => a - b), [3, 4, 5, 14]) |
                    this.compare_array(e.sort((a, b) => a - b), [11, 12, 13, 14])) {
                    this.straightdraw.push('gutshot straight draw')
                } else if (dif == 3) {
                    //[2, 3, 4, 5]など
                    this.straightdraw.push('openend straight draw')
                } else if (dif == 4) {
                    //[2, 3, 5, 6]など
                    this.straightdraw.push('gutshot straight draw')
                }
            })
        }
        //重複除く数字が3つ以上の場合かつ役完成とストレートドローがない場合のみバックドアストレートドローの判定を行う
        if (hand.length == 5 && new_array.length >= 3 && this.straightdraw.length == 0 && this.rank != 'straightflush' && this.rank != 'straight') {
            const array_combi = combination(new_array, 3)
            array_combi.forEach((e) => {
                const dif = Math.max(...e) - Math.min(...e)
                if (dif <= 4 ||
                    this.compare_array(e.sort((a, b) => a - b), [2, 3, 14]) ||
                    this.compare_array(e.sort((a, b) => a - b), [2, 4, 14]) ||
                    this.compare_array(e.sort((a, b) => a - b), [2, 5, 14]) ||
                    this.compare_array(e.sort((a, b) => a - b), [3, 4, 14]) ||
                    this.compare_array(e.sort((a, b) => a - b), [3, 5, 14]) ||
                    this.compare_array(e.sort((a, b) => a - b), [4, 5, 14])) {
                    this.straightdraw.push('backdoor straight draw')
                }
            })

        }
    }
}


let myCard, oppCard, communityCard, myRank, myScore, oppRank, oppScore

$('#start').on('click', () => {
    let deck = make_deck()
    myCard = randomSelect(deck, 4)
    oppCard = randomSelect(deck, 4)
    communityCard = randomSelect(deck, 5)

    const hand = new Hand
    hand.check_hand(myCard, communityCard)
    myRank = hand.rank
    myScore = hand.score
    hand.check_hand(oppCard, communityCard)
    oppRank = hand.rank
    oppScore = hand.score

    $('#myhand1').attr('src', `./cards/${myCard[0]}.gif`);
    $('#myhand2').attr('src', `./cards/${myCard[1]}.gif`);
    $('#myhand3').attr('src', `./cards/${myCard[2]}.gif`);
    $('#myhand4').attr('src', `./cards/${myCard[3]}.gif`);

    $('#opphand1').attr('src', `./cards/hidden.gif`);
    $('#opphand2').attr('src', `./cards/hidden.gif`);
    $('#opphand3').attr('src', `./cards/hidden.gif`);
    $('#opphand4').attr('src', `./cards/hidden.gif`);

    $('#flop1').attr('src', `./cards/${communityCard[0]}.gif`);
    $('#flop2').attr('src', `./cards/${communityCard[1]}.gif`);
    $('#flop3').attr('src', `./cards/${communityCard[2]}.gif`);
    $('#turn').attr('src', `./cards/hidden.gif`);
    $('#river').attr('src', `./cards/hidden.gif`);

});

$('#result').on('click', () => {
    $('#turn').attr('src', `./cards/${communityCard[3]}.gif`);
    $('#river').attr('src', `./cards/${communityCard[4]}.gif`);

    $('#opphand1').attr('src', `./cards/${oppCard[0]}.gif`);
    $('#opphand2').attr('src', `./cards/${oppCard[1]}.gif`);
    $('#opphand3').attr('src', `./cards/${oppCard[2]}.gif`);
    $('#opphand4').attr('src', `./cards/${oppCard[3]}.gif`);

    $('#myResult').text(myRank)
    $('#oppResult').text(oppRank)

    if (myScore > oppScore) {
        let Music = new Audio("./sound/win.mp3");
        Music.play();
    } else if (myScore < oppScore) {
        let Music = new Audio("./sound/lose.mp3");
        Music.play();
    } else {
        let Music = new Audio("./sound/step.mp3");
        Music.play();
    }

})

//関数

//52枚のトランプを作成
const make_deck = () => {
    let deck = []
    const num_list = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
    const suit_list = ['s', 'h', 'd', 'c']
    num_list.forEach(num => {
        suit_list.forEach(suit => {
            deck.push(num + suit)
        });
    });
    return deck
}

const combination = (nums, k) => {
    let ans = [];
    if (nums.length < k) {
        return []
    }
    if (k === 1) {
        for (let i = 0; i < nums.length; i++) {
            ans[i] = [nums[i]];
        }
    } else {
        for (let i = 0; i < nums.length - k + 1; i++) {
            let row = combination(nums.slice(i + 1), k - 1);
            for (let j = 0; j < row.length; j++) {
                ans.push([nums[i]].concat(row[j]));
            }
        }
    }
    return ans;
}

const randomSelect = (array, num) => {
    let newArray = [];
    while (newArray.length < num && array.length > 0) {
        // 配列からランダムな要素を選ぶ
        const rand = Math.floor(Math.random() * array.length);
        // 選んだ要素を別の配列に登録する
        newArray.push(array[rand]);
        // もとの配列からは削除する
        array.splice(rand, 1);
    }
    return newArray
}