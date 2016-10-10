"""empty message

Revision ID: d80a61b802af
Revises: 9301b74bd198
Create Date: 2016-08-20 13:49:16.259257

"""

# revision identifiers, used by Alembic.
revision = 'd80a61b802af'
down_revision = '9301b74bd198'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('fbuser', sa.Column('access_token', sa.String(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('fbuser', 'access_token')
    ### end Alembic commands ###