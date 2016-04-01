Object.equals = function( a, b )
{
    if ( a === b )
    {
        return true;
    }
    if ( !(a instanceof Object) || !(b instanceof Object) )
    {
        return false;
    }
    if ( a.constructor !== b.constructor )
    {
        return false;
    }

    for ( var key in a )
    {
        if ( !a.hasOwnProperty( key ) )
        {
            continue;
        }
        if ( !b.hasOwnProperty( key ) )
        {
            return false;
        }
        if ( a[key] === b[key] )
        {
            continue;
        }
        if ( typeof( a[key] ) !== "object" )
        {
            return false;
        }
        if ( !Object.equals( a[key], b[key] ) )
        {
            return false;
        }
    }

    for ( var key in b )
    {
        if ( b.hasOwnProperty( key ) && !a.hasOwnProperty( key ) )
        {
            return false;
        }
    }

    return true;

};