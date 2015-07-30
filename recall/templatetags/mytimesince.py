from __future__ import unicode_literals

import datetime

from django.utils.html import avoid_wrapping
from django.utils.timezone import is_aware, utc
from django.utils.translation import ugettext, ungettext_lazy
from django import template
register = template.Library()
TIMESINCE_CHUNKS = (
    (60 * 60 * 24 * 365, ungettext_lazy('%d year', '%d years')),
    (60 * 60 * 24 * 30, ungettext_lazy('%d month', '%d months')),
    (60 * 60 * 24 * 7, ungettext_lazy('%d week', '%d weeks')),
    (60 * 60 * 24, ungettext_lazy('%d day', '%d days')),
    (60 * 60, ungettext_lazy('%d hour', '%d hours')),
    (60, ungettext_lazy('%d minute', '%d minutes'))
)


def mytimesince(d, now=None, reversed=False):
    """
    Takes two datetime objects and returns the time between d and now
    as a nicely formatted string, e.g. "10 minutes".  If d occurs after now,
    then "0 minutes" is returned.

    Units used are years, months, weeks, days, hours, and minutes.
    Seconds and microseconds are ignored.  Up to two adjacent units will be
    displayed.  For example, "2 weeks, 3 days" and "1 year, 3 months" are
    possible outputs, but "2 weeks, 3 hours" and "1 year, 5 days" are not.

    Adapted from
    http://web.archive.org/web/20060617175230/http://blog.natbat.co.uk/archive/2003/Jun/14/time_since
    """
    # Convert datetime.date to datetime.datetime for comparison.
    if not isinstance(d, datetime.datetime):
        d = datetime.datetime(d.year, d.month, d.day)
    if now and not isinstance(now, datetime.datetime):
        now = datetime.datetime(now.year, now.month, now.day)

    if not now:
        now = datetime.datetime.now(utc if is_aware(d) else None)

    delta = (d - now) if reversed else (now - d)
    # ignore microseconds
    since = delta.days * 24 * 60 * 60 + delta.seconds
    if since <= 0:
        # d is in the future compared to now, stop processing.
        return avoid_wrapping(ugettext('0 minutes'))
    for i, (seconds, name) in enumerate(TIMESINCE_CHUNKS):
        count = since // seconds
        if count != 0:
            break
    result = avoid_wrapping(name % count)
    return result


def mytimeuntil(d, now=None):
    """
    Like timesince, but returns a string measuring the time until
    the given time.
    """
    return mytimesince(d, now, reversed=True)

register.filter('mytimesince',mytimesince)
