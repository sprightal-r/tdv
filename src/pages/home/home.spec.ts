import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { testConfig } from '@app/app.config';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  const component = () => fixture.componentInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: testConfig.providers
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component()).toBeTruthy();
  });
});
