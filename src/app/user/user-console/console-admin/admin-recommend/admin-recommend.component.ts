import {Component, OnInit, OnDestroy} from '@angular/core'
import {Title} from '@angular/platform-browser'
import {Router} from '@angular/router'
import {Subject} from 'rxjs/Subject'
import {Observable} from 'rxjs/Observable'

import {Option} from './option'
import {List} from './list'
import {RecommendService} from './recommend.service'
import {StaticService} from '../../../../shared/service/static'

@Component({
    selector: 'app-admin-recommend',
    templateUrl: './admin-recommend.component.html',
    styleUrls: ['./admin-recommend.component.scss'],
    providers: [RecommendService]
})
export class AdminRecommendComponent implements OnInit, OnDestroy {

    constructor (
        private recommendService: RecommendService,
        private staticService: StaticService,
        private titleService: Title,
        private router: Router
    ){
    }
    public option: Option
    public list: Observable<List[]>
    public showAlert: boolean = false

    private searchTerms = new Subject<string>()
    private timer: any


    getOption (){
        this.recommendService.getOption()
            .subscribe(
                option => this.option = option,
                error =>{
                    return this.staticService.toastyInfo(error.json().message);
                }
            )
    }
    changeOption (item: any, destroyRecommended: boolean){
        if (destroyRecommended){
            this.option.recommended.map(v =>{
                if (v.id != item.id) return item
                return null
            })
        }
    }
    showOptionStatus (item){
        const isRecommended = this.option.recommended.some(v => v.id === item.id)
        return isRecommended? '取消推荐': '加入推荐'
    }

    search (keyWord: string){
        if (!keyWord) return this.searchTerms.next('allArticles')
        this.searchTerms.next(keyWord)
    }

    ngOnInit (){
        this.titleService.setTitle('推荐文章-维特博客')
        this.getOption()

        this.list = this.searchTerms
            .debounceTime(300)
            .distinctUntilChanged()
            .switchMap(word => this.recommendService.search(word))
            .catch(error => {
                console.log(error);
                return Observable.of<List[]>([]);
            })
        this.timer = setTimeout( () =>{this.search('')},300)
    }
    ngOnDestroy (){
        this.timer&& clearTimeout(this.timer)
    }

}
