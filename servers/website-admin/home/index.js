import cache from '<common>/cache';
import { adminLogger } from '<common>/logger';
import { tokenRequired } from '<common>/decorator';

import Request from '<admin>/utils/request';


class Home {
  @tokenRequired
  index(req, res, next) {
    const { uid } = req.cookies;

    res.render('index', { title: 'Website Admin' });
  }
}

export default new Home;
